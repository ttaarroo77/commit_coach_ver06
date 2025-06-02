import express from 'express';
import { prisma } from '../lib/prisma';
import OpenAI from 'openai';
import { auth } from '../middleware/auth';
import { rateLimiter } from '../middleware/rate-limiter';
import { Readable } from 'stream';

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 独立したミドルウェアファイルに移動したため、このコードは削除

// プロジェクト情報を取得
async function getProjectInfo(projectId: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          include: {
            subtasks: true
          }
        }
      }
    });
    return project;
  } catch (error) {
    console.error('プロジェクト情報の取得に失敗しました:', error);
    return null;
  }
}

// システムプロンプトを構築
function buildSystemPrompt(projectInfo: any) {
  let systemPrompt = `あなたはプロジェクト開発をサポートするAIコーチです。`;
  
  if (projectInfo) {
    systemPrompt += `\n\nプロジェクト: ${projectInfo.title}`;
    
    if (projectInfo.description) {
      systemPrompt += `\n概要: ${projectInfo.description}`;
    }
    
    if (projectInfo.tasks && projectInfo.tasks.length > 0) {
      systemPrompt += `\n\nタスク一覧:`;
      projectInfo.tasks.forEach((task: any) => {
        systemPrompt += `\n- ${task.title} (${task.status})`;
        
        if (task.subtasks && task.subtasks.length > 0) {
          task.subtasks.forEach((subtask: any) => {
            systemPrompt += `\n  - ${subtask.title} ${subtask.isCompleted ? '✓' : ''}`;
          });
        }
      });
    }
  }
  
  return systemPrompt;
}

// チャットAPIエンドポイント
router.post('/', auth, rateLimiter(1), async (req, res) => {
  try {
    const { message, conversationId, projectId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 既存の会話か新しい会話かを判断
    let conversation;
    if (conversationId) {
      // 既存の会話を取得
      conversation = await prisma.conversation.findUnique({
        where: {
          id: conversationId,
          userId: userId
        },
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc'
            }
          }
        }
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
    } else {
      // 新しい会話を作成
      conversation = await prisma.conversation.create({
        data: {
          userId: userId,
          projectId: projectId || null,
          title: message.substring(0, 30) + (message.length > 30 ? '...' : '')
        },
        include: {
          messages: true
        }
      });
    }

    // ユーザーメッセージを保存
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: message,
        role: 'user'
      }
    });

    // プロジェクト情報を取得
    let projectInfo = null;
    if (projectId) {
      projectInfo = await getProjectInfo(projectId);
    }

    // システムプロンプトを構築
    const systemPrompt = buildSystemPrompt(projectInfo);

    // OpenAIへのリクエスト用にメッセージ履歴を準備
    const messageHistory = [
      { role: 'system', content: systemPrompt },
      ...conversation.messages.map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content
      })),
      { role: 'user', content: message }
    ];

    // OpenAIのストリーミングレスポンスをセットアップ
    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messageHistory,
      stream: true,
    });

    // ストリーミングレスポンスをクライアントに送信
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let assistantResponse = '';

    // Node.jsのストリームを作成
    const responseStream = new Readable({
      read() {}
    });

    // ストリームイベントを処理
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        assistantResponse += content;
        responseStream.push(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // ストリームの終了を示す
    responseStream.push(`data: ${JSON.stringify({ done: true })}\n\n`);
    responseStream.push(null);

    // ストリームをレスポンスにパイプ
    responseStream.pipe(res);

    // ストリーム終了後にアシスタントの応答を保存
    responseStream.on('end', async () => {
      try {
        if (assistantResponse) {
          await prisma.message.create({
            data: {
              conversationId: conversation.id,
              content: assistantResponse,
              role: 'assistant'
            }
          });
        }
      } catch (error) {
        console.error('アシスタントメッセージの保存に失敗しました:', error);
      }
    });

  } catch (error) {
    console.error('チャット処理中にエラーが発生しました:', error);
    // ストリーミングが始まっていない場合はJSONレスポンスを返す
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// 会話履歴を取得するエンドポイント
router.get('/conversations', auth, rateLimiter(2), async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          },
          take: 1 // 最初のメッセージだけを取得（タイトル表示用）
        }
      }
    });

    res.json(conversations);
  } catch (error) {
    console.error('会話履歴の取得に失敗しました:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 特定の会話を取得するエンドポイント
router.get('/conversations/:id', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const conversationId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
        userId: userId
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('会話の取得に失敗しました:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
