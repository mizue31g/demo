import pandas as pd
import random
import csv

# 選択肢の定義（日本語） [cite: 4-49]
options_1 = ["① 住所地", "② 出身", "③ 居住経験", "④ 親戚・知人", "⑤ 仕事", "⑥ 観光", "⑦ ふるさと納税", "⑧ その他【自由記述】", "⑨ 特にない"]
options_2 = ["① 1年未満", "② 2～3年未満", "③ 3～5年未満", "④ 5～10年未満", "⑤ 10～15年未満", "⑥ 15～20年未満", "⑦ 20～25年未満", "⑧ 25～30年未満", "⑨ 30年以上"]
options_3 = ["① 自然", "② 都市機能", "③ 歴史・文化", "④ 観光", "⑤ 特産品", "⑥ 人柄・土地柄", "⑦ 居住地との距離", "⑧ 著名人・作品のゆかりがある", "⑨ その他【自由記述】"]
options_4 = ["① イベント", "② 地域の魅力", "③ ご当地ニュース", "④ 担い手募集"]
options_5 = ["① 0回", "② 1回", "③ 2～4回", "④ 5～10回", "⑤ 11回以上"]
options_6 = ["① 0日", "② 1～2日", "③ 3～5日", "④ 6～9日", "⑤ 10～14日", "⑥ 15～19日", "⑦ 20～29日", "⑧ 30日以上"]
options_7 = ["① 帰省", "② 親戚・知人との交流", "③ 仕事", "④ 担い手活動", "⑤ 観光・イベント", "⑥ その他【自由記述】"]
options_8 = ["① 自家用車", "② 鉄道", "③ 飛行機", "④ 船舶", "⑤ その他【自由記述】"]
options_9 = ["① 具体的に検討中", "② 関心あり", "③ いずれ検討する可能性がある", "④ 特に希望しない"]
options_10 = ["⓪ 未定", "① 経済的な貢献", "② 定期的な訪問", "③ 副業・ボランティア"]
options_11 = ["① まちづくり", "② 医療・介護", "③ 教育・保育", "④ デジタル", "⑤ 広報", "⑥ 経営支援", "⑦ 建築・土木", "⑧ 国際", "⑨ 交通", "⑩ 農林水産", "⑪ その他【自由記述】"]

data = []
for i in range(1, 1001):
    row = {"response_id": i}
    
    # 1. 地域との縁
    q1 = random.choice(options_1)
    row["q1_relationship"] = q1
    row["q1_other_note"] = "学生時代のボランティア活動の拠点" if "⑧" in q1 else ""
    
    # 2. 関わり年数
    row["q2_years"] = random.choice(options_2)
    
    # 住所地(Residence)の場合は3-10をスキップ 
    if "①" in q1:
        skip_cols = ["q3_attractions", "q3_other", "q4_interests", "q5_visits", "q6_days", 
                     "q7_reason", "q7_other", "q8_transport", "q8_other", "q9_migration", "q10_engagement", "q10_details"]
        for col in skip_cols:
            row[col] = ""
    else:
        # 3. 地域の魅力 (3つ選択)
        m3 = random.sample(options_3, 3)
        row["q3_attractions"] = "|".join(m3)
        row["q3_other"] = "地元の温泉文化と食事が素晴らしい" if any("⑨" in s for s in m3) else ""
        
        row["q4_interests"] = random.choice(options_4)
        row["q5_visits"] = random.choice(options_5)
        row["q6_days"] = random.choice(options_6)
        
        q7 = random.choice(options_7)
        row["q7_reason"] = q7
        row["q7_other"] = "伝統的な祭りに参加するため" if "⑥" in q7 else ""
        
        q8 = random.choice(options_8)
        row["q8_transport"] = q8
        row["q8_other"] = "高速バスの回数券を利用" if "⑤" in q8 else ""
        
        row["q9_migration"] = random.choice(options_9)
        
        q10 = random.choice(options_10)
        row["q10_engagement"] = q10
        if "①" in q10:
            row["q10_details"] = "寄付額:50,000円 / 返礼品:有"
        elif "③" in q10:
            row["q10_details"] = "IT・デジタル分野の技術支援 / 月4日程度"
        else:
            row["q10_details"] = ""

    # 11. スキル
    q11 = random.choice(options_11)
    row["q11_skills"] = q11
    row["q11_other"] = "データ分析および生成AIの活用" if "⑪" in q11 else ""
    
    data.append(row)

df = pd.DataFrame(data)
df.to_csv("furusato_survey_japanese_for_bq.csv", index=False, encoding="utf-8-sig", quoting=csv.QUOTE_ALL)