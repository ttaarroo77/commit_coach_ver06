# 人間の質問：
AIアプリのLPの見た目が左右対称ではなくて不自然です。どこのディレクトリにあるどのコードをどう修正すべきなのか、リポジトリを分析して答えなさい。



# AI の回答：

## 不自然な “左右⾮対称” が起きている理由  
- **LP の 2 か所で、同じ <Grid> の 2 カラム内の揃え⽅が左右でバラバラ**  
  1. ヒーローセクション（⾏ 34 付近）では  
     - 左カラム：`flex flex‑col justify-center` でセル左端に寄せたまま  
     - 右カラム：`flex items-center justify-center` でセル中央寄せ  
  2. AI コーチ紹介セクション（⾏ 120 付近）では  
     - 左カラム：`justify-center`  
     - 右カラム：左寄せ  
  その結果、**視覚的な重⼼が左右でズレてしまい、余⽩の取り⽅もアンバランス** になります。  
  また、イラストカードに `w-[400px] / w-[500px]` の固定幅を与えているため、画⾯幅によっては左右のカラム幅がまちまちになり、さらに不⾃然さが⽬⽴ちます。   

---

## 修正すべきファイルとディレクトリ
```
frontend/app/page.tsx   （ランディングページそのもの）
```

---

## 具体的な修正内容（diff 形式）

```diff
@@
- <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
+ <!-- ① ヒーローセクションを左右とも中央寄せ -->
+ <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center justify-items-center">
@@
- <div className="flex items-center justify-center">
-   <div className="relative h-[300px] w-[400px] overflow-hidden rounded-lg bg-gray-100 p-4">
+ <!-- イラストカードに固定幅ではなく max-w を使う -->
+ <div className="flex items-center lg:justify-end">
+   <div className="relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-lg bg-gray-100 p-4">
@@
- <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
+ <!-- ② AIコーチ紹介セクションも上下左右中央揃え -->
+ <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center justify-items-center">
@@
- <div className="flex items-center justify-center">
-   <div className="relative h-[400px] w-[500px] overflow-hidden rounded-lg bg-gray-100 p-4">
+ <div className="flex items-center lg:justify-start">
+   <div className="relative aspect-[4/3] w-full max-w-lg overflow-hidden rounded-lg bg-gray-100 p-4">
```

### ポイント
1. **`items-center justify-items-center` を親グリッドに追加**  
   グリッドセル全体を上下左右とも中央揃えに統一することで、左右の重心がそろいます。  
2. **左右のセル内では `lg:justify-end / lg:justify-start` で端寄せ**  
   画⾯幅が広いときだけ “⽂章は左寄せ・イメージは右寄せ” にすることで、典型的なヒーローレイアウトの対称性を保ちます。  
3. **イラストカードは `max-w` と `aspect-[4/3]` でレスポンシブ化**  
   固定幅をなくすことで、カラム幅（1fr, 1fr）が純粋に 50 : 50 になり、どの解像度でも左右バランスが取れます。  

---

これら 4 行程度のクラス名置換だけで、**左右対称のきれいなレイアウト**になります。 필요に応じて同ファイル内の他の固定幅 (`w-[400px]` など) も同様に `max-w-*` へ置き換えると、さらに自然なレスポンシブ挙動になります。