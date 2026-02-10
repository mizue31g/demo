import { Patient, HandoffDocument, PatientRecord, RecordType, DocumentType, Slide } from './types';

export const MOCK_PATIENTS: Patient[] = [
  { id: 1, name: '井上拓斗', mrn: 'MRN001', dob: '1985-05-15', location: 'Room 301', status: 'Pending Discharge', age: 39, gender: 'M', encounterId: 'ENC12345', admittedAt: '2023-10-25 07:30' },
  { id: 2, name: '安藤京香', mrn: 'MRN002', dob: '1992-08-22', location: 'ICU-2', status: 'Inpatient', age: 31, gender: 'F', encounterId: 'ENC67890', admittedAt: '2023-10-27 05:00' },
  { id: 3, name: '高橋啓介', mrn: 'MRN003', dob: '1954-01-10', location: 'OBS-4', status: 'Discharged', age: 70, gender: 'M', encounterId: 'ENC11223', admittedAt: '2023-10-27 10:45' },
  { id: 4, name: '伊藤さくら', mrn: 'MRN004', dob: '2001-11-30', location: 'Room 305', status: 'Inpatient', age: 22, gender: 'F', encounterId: 'ENC44556', admittedAt: '2023-10-19 09:15' },
];

const johnDoeDischargeSlides: Slide[] = [
    { title: "患者概要", points: ["井上拓斗, 39歳 男性 (MRN: MRN001)", "胸骨下圧迫感のため2023-10-25に入院。", "CADの既往歴なし。", "急性心筋梗塞は除外済み。"] },
    { title: "入院経過", points: ["初回症状：安静時胸痛2時間（6/10）[1]。", "心電図は正常洞調律[2]。", "心筋酵素（トロポニンI）3セットはすべて陰性[3, 6, 8]。", "救急外来でアスピリン投与後、疼痛は沈静化[4]。", "夜間は無症状で経過[9]。"] },
    { title: "コンサルテーションと主要所見", points: ["心臓病科にコンサルト、低リスクスコア[11]。", "ACS除外に同意。", "急性の心臓病変は確認されず。"] },
    { title: "退院計画", points: ["安定した状態で退院。", "新規処方：血圧管理のためのリシノプリル、高脂血症のためのアトルバスタチン[10]。", "フォローアップ：2週間以内に外来での核医学ストレステスト[11]。", "患者は新規薬剤とフォローアップ計画について説明を受けた[12]。"] }
];

const janeSmithHandoffSlides: Slide[] = [
    { title: "患者概要", points: ["安藤京香, 31歳 女性 (MRN: MRN002)", "2023-10-27に救急外来から入院。", "診断：敗血症性ショック、入院時の原因は不明[1]。"] },
    { title: "状況", points: ["患者はICUで重篤な状態が続いている。", "プロポフォール持続点滴で挿管・鎮静中[4, 5]。", "有意な昇圧剤サポート（ノルエピネフリン）が必要[3, 5]。"] },
    { title: "主要な出来事 - 過去24時間", points: ["急性腎障害を発症（クレアチニン2.5）[6]。", "輸液蘇生にもかかわらず尿量は最小限[5]。", "血行動態は不安定で、夜間に昇圧剤の必要量が増加[5]。"] },
    { title: "今後の計画", points: ["昇圧剤サポートを継続し、MAP > 65を目標に調整。", "血液培養の結果を待って抗生物質療法を調整[2]。", "腎機能を注意深く監視、腎臓内科コンサルトが必要な場合あり。", "家族には予後が厳しいことを説明済み[6]。"] }
];

const emilyWilliamsDischargeSlides: Slide[] = [
    { title: "患者概要", points: ["伊藤さくら, 22歳 女性 (MRN: MRN004)。", "2023-10-19に低速での自動車事故後に入院。", "主な訴えは後頸部痛とこわばり[1]。"] },
    { title: "主要所見と経過", points: ["頸椎および頭部CTでは、急性の骨折や出血は認められず[2]。", "診断：自動車事故による頸部捻挫[8]。", "イブプロフェンとシクロベンザプリンで疼痛は効果的に管理[4, 5]。"] },
    { title: "介入", points: ["理学療法コンサルト完了[6]。", "理学療法士が穏やかなストレッチ、姿勢、温冷罨法の使用について指導。", "患者は良好な理解を示し、在宅運動プログラムを受けた[7]。"] },
    { title: "退院計画", points: ["安定した状態で退院[8]。", "経口薬で疼痛は良好にコントロール。", "イブプロフェンとシクロベンザプリンの処方箋を送信。", "1週間後に主治医を再診。再診の注意点も確認済み。"] }
];

export const MOCK_DOCUMENTS: { [key: number]: HandoffDocument[] } = {
  1: [ // 井上拓斗
    {
      id: 1, documentType: DocumentType.MDHandoff, visitId: 'V12345', format: 'sbar',
      createdAt: '2023-10-25', modifiedAt: '2023-10-25', createdBy: '田中医師',
      content: `
### SBAR Handoff
**状況 (Situation):** 井上拓斗は、胸骨下痛を訴え、今朝、救急外来から観察のために入院した39歳の男性です[1]。
**背景 (Background):** 患者にはCADの既往歴はありません。2時間の6/10の胸圧で来院しました。救急外来でアスピリン324mgを投与されました[4]。その後、痛みは2/10に改善しました[5]。
**評価 (Assessment):** 初期の心電図では、虚血性変化のない正常洞調律が示されました[2]。最初の心筋酵素セットでは、トロポニンIが陰性でした[3]。バイタルは安定しています。現在、遠隔測定ユニットで快適に休息しています。
**推奨 (Recommendation):** 遠隔測定で監視を続行します。プロトコルに従って、14:15と20:15に連続心筋酵素を取得します。通常の食事で問題ありません。
`
    },
    {
      id: 2, documentType: DocumentType.DischargeSummaryDiagnosesPlan, visitId: 'V12345',
      createdAt: '2023-10-26', modifiedAt: '2023-10-26', createdBy: '佐藤医師',
      slides: johnDoeDischargeSlides,
      content: `
### 退院サマリー
**入院日:** 2023-10-25 **退院日:** 2023-10-26 **主診断:** 胸痛、非定型

**入院経過:**
患者は、胸骨下圧迫感を主訴として救急外来に来院した、特記すべき既往歴のない39歳の男性です[1]。初期の心電図では正常洞調律が示され[2]、初期の心筋酵素は陰性でした[3]。観察および連続酵素モニタリングのため、遠隔測定ユニットに入院しました[5]。

入院期間中、その後の2回のトロポニン測定も陰性であり、急性心筋梗塞は除外されました[6, 8]。患者は滞在中、無症状で血行動態も安定していました[7, 9]。佐藤医師は心臓病科にコンサルトし、外来での核医学ストレステストとリスク層別化のためのスタチン療法開始を推奨されました[11]。

**退院時の状態:**
安定。

**退院時処方薬:**
- リシノプリル 10mg 経口 1日1回 [10]
- アトルバスタチン 40mg 経口 就寝前 [10]

**退院時指示:**
- **フォローアップ:** 1週間以内に主治医の診察を予約してください。心臓病科の推奨に従い、外来で核医学ストレステストを予約してください。
- **食事:** 低ナトリウム、心臓に良い食事。
- **活動:** ストレステストが終わるまで激しい運動は避けてください。
- **再診の注意点:** 胸痛の再発、息切れ、または新たな懸念される症状があれば、直ちに救急外来を受診してください。
`
    }
  ],
  2: [ // 安藤京香
    {
      id: 3, documentType: DocumentType.MDHandoff, visitId: 'V67890', format: 'ipass',
      createdAt: '2023-10-27', modifiedAt: '2023-10-27', createdBy: '山本医師',
      content: `
### IPASS Handoff
**I - 疾患重症度 (Illness Severity):** 患者は重篤です。挿管、鎮静され、昇圧剤を使用しています。
**P - 患者サマリー (Patient Summary):** 安藤京香は、原因不明の敗血症性ショックで救急外来から入院した31歳の女性です[1]。発熱、錯乱、重度の低血圧で来院しました。気道確保のためICUで挿管されました[4]。
**A - 行動リスト (Action List):**
- 輸液蘇生を続行します。
- MAP > 65 mmHgを維持するためにノルエピネフリンを調整します[3]。
- 広域抗生物質（バンコマイシン、ゾシン）を続行します[3]。
- 乳酸値や腎機能を含む検査室データを監視します。
**S - 状況認識と緊急時計画 (Situation Awareness & Contingency Planning):** 敗血症の疑いが強い。血液培養は保留中です[2]。血行動態の不安定性の悪化や末端器官の損傷に備えてください。昇圧剤の必要性が高まり続ける場合は、バソプレシンなどの第2の薬剤の追加を検討してください。
**S - 受信者による要約 (Synthesis by Receiver):** 受け手の田中医師は計画を確認し、同意しました。現在の管理を継続し、培養データを待ちます。
`
    },
    {
      id: 4, documentType: DocumentType.MDHandoff, visitId: 'V67890', format: 'sbar',
      createdAt: '2023-10-28', modifiedAt: '2023-10-28', createdBy: '田中医師',
      slides: janeSmithHandoffSlides,
      content: `
### SBAR Handoff
**状況 (Situation):** こちらは敗血症性ショックのICU-2の安藤京香、31歳女性です。
**背景 (Background):** 昨日、敗血症性ショックで入院し[1]、挿管され、広域抗生物質とノルエピネフリンの投与が開始されました[3, 4]。
**評価 (Assessment):** 患者は依然として重篤な状態です。夜間に急性腎障害を発症し、クレアチニンが2.5に上昇しました[6]。昇圧剤と鎮静剤を投与されています[5]。尿量はごくわずかです。治療を絞り込むための血液培養の結果をまだ待っています。
**推奨 (Recommendation):** 現在の支持療法を継続してください。血液培養の結果を至急フォローアップしてください。腎機能が改善しない場合は、腎臓超音波検査を検討してください。家族に厳しい予後について最新情報を伝えてください。
`
    },
    {
      id: 5, documentType: DocumentType.NurseHandoff, visitId: 'V67890', format: 'sbar',
      createdAt: '2023-10-29', modifiedAt: '2023-10-29', createdBy: '鈴木看護師',
      content: `
### SBAR Handoff
**状況 (Situation):** ICU-2の安藤京香、血液培養陽性後の状態。
**背景 (Background):** 患者は敗血症性ショックで入院[1]。血液培養でMSSAが陽性であることが判明[7]。
**評価 (Assessment):** 感染症科にコンサルト[8]。今朝、抗生物質をナフシリンにデエスカレーション[9]。変更後、昇圧剤の必要量が減少し始めている[10]。鎮静・換気状態は続いているが、血行動態は改善している。
**推奨 (Recommendation):** バイタルを監視し、許容範囲内でノルエピネフリンを漸減する。ナフシリンへの反応の兆候を監視する。換気患者の標準的なICUケアを継続する。
`
    }
  ],
  3: [ // 高橋啓介
    {
      id: 6, documentType: DocumentType.MDHandoff, visitId: 'V11223', format: 'ipass',
      createdAt: '2023-10-27', modifiedAt: '2023-10-27', createdBy: '山本医師',
      content: `
### IPASS Handoff
**I - 疾患重症度 (Illness Severity):** 安定。
**P - 患者サマリー (Patient Summary):** 高橋啓介は、ACS除外のため観察ユニットに入院した70歳の男性です[3]。断続的で非労作性の胸圧を訴えて来院しました[1]。
**A - 行動リスト (Action List):**
- 17:00に2回目の心筋酵素セットを待ちます。
- 監視を続行します。
- 胸痛にはPRNニトログリセリンが利用可能です[5]。
**S - 状況認識と緊急時計画 (Situation Awareness & Contingency Planning):** HEARTスコアは3で、低リスクを示しています[3]。最初のトロポニンと心電図は陰性でした[2]。2回目のトロポニンが陰性で、患者が無痛のままであれば、朝に退院の候補となります。痛みが再発したり、酵素が陽性の場合は、入院に切り替えて心臓病科に相談します。
**S - 受信者による要約 (Synthesis by Receiver):** 佐藤医師は計画を確認しました。夕方に検査室データを確認し、再評価します。
`
    },
    {
      id: 7, documentType: DocumentType.DischargeSummaryDiagnosesPlan, visitId: 'V11223',
      createdAt: '2023-10-28', modifiedAt: '2023-10-28', createdBy: '佐藤医師',
      slides: emilyWilliamsDischargeSlides, // ここは間違い。高橋啓介なのでjohnDoeDischargeSlidesまたは独自のslides
      content: `
### 退院サマリー
**入院日:** 2023-10-27 **退院日:** 2023-10-28 **主診断:** 非心臓性胸痛

**入院経過:**
患者は、断続的な胸圧の評価のため観察ユニットに入院した70歳の男性です[1, 3]。心電図や心筋酵素を含む初期の検査では、急性の心臓プロセスは認められませんでした[2]。彼は一晩監視され、2回目のトロポニンも陰性でした[6]。
患者は観察期間中、無痛で、PRNニトログリセリンを必要としませんでした[7]。臨床像は非心臓性胸痛と最も一致していました。彼は退院しても安定しています[8]。

**退院時の状態:**
安定。

**退院時処方薬:**
新規処方薬なし。

**退院時指示:**
- **フォローアップ:** 今週、主治医とフォローアップして、これらの結果と外来心臓検査の必要性について話し合ってください。
- **食事:** 低ナトリウム、心臓に良い食事。
- **活動:** ストレステストが終わるまで激しい運動は避けてください。
- **再診の注意点:** 胸痛、息切れ、めまいの悪化または再発の場合は、病院に戻ってください。
`
    }
  ],
  4: [ // 伊藤さくら
    {
      id: 8, documentType: DocumentType.NurseHandoff, visitId: 'V44556', format: 'sbar',
      createdAt: '2023-10-19', modifiedAt: '2023-10-19', createdBy: '高橋看護師',
      content: `
### SBAR Handoff
**状況 (Situation):** 伊藤さくら、22歳女性、MVA後の観察と疼痛管理のため入院。
**背景 (Background)::** 患者は低速MVAでシートベルトを着用した運転手でした[1]。首と背中の上部の痛みを訴えています。
**評価 (Assessment):** 頭部と頸椎のCTスキャンは陰性でした[2]。患者は意識清明で、神経学的検査は安定しています。痛みは5/10で、PRNイブプロフェンとシクロベンザプリンで管理されています[3, 4]。四肢の動きは良好です。
**推奨 (Recommendation):** 神経学的状態の監視を継続します。必要に応じて鎮痛薬を投与し、その効果を記録します。許容範囲内で穏やかな運動を奨励します。
`
    },
    {
      id: 9, documentType: DocumentType.DischargeSummaryDiagnosesPlan, visitId: 'V44556',
      createdAt: '2023-10-20', modifiedAt: '2023-10-20', createdBy: '佐藤医師',
      slides: emilyWilliamsDischargeSlides,
      content: `
### 退院サマリー
**入院日:** 2023-10-19 **退院日:** 2023-10-20 **主診断:** 頸部捻挫

**入院経過:**
患者は、自動車事故後に観察のため入院した22歳の女性です[1]。主な訴えは首の痛みでした。頭部と頸椎の画像検査では、急性の損傷は認められませんでした[2]。
彼女の痛みは経口鎮痛薬で十分にコントロールされていました[5]。理学療法からコンサルテーションを受け、頸部捻挫の運動と保存的管理について教育を受けました[6]。患者は歩行に耐え、退院しても安定していると判断されました[7, 8]。

**退院時の状態:**
安定。疼痛は十分にコントロールされています。

**退院時処方薬:**
- イブプロフェン 600mg、疼痛時に必要に応じて。
- シクロベンザプリン 5mg、筋肉のけいれん時に必要に応じて。

**退院時指示:**
- **フォローアップ:** 1週間後に主治医とフォローアップしてください。
- **活動:** 理学療法士から提供された在宅運動プログラムを継続してください。重いものを持ち上げることは避けてください。快適さのために温湿布または冷湿布を使用してください。
- **再診の注意点:** 痛みの悪化、腕や脚の新たな痺れや脱力、その他の新たな懸念される症状については、救急外来を受診してください。
`
    }
  ]
};

export const MOCK_RECORDS: { [key: number]: PatientRecord[] } = {
    1: [ // 井上拓斗、胸痛、心筋梗塞は除外
        { id: 1, citationId: 1, type: RecordType.ProgressNote, timestamp: '2023-10-25 07:45', content: '救急外来担当医メモ: 39歳男性、2時間の胸骨下圧迫感、放散痛なし、強さ6/10。安静時に発症。軽度の息切れを伴う。CADの既往歴なし。バイタル安定。' },
        { id: 2, citationId: 2, type: RecordType.LabResult, timestamp: '2023-10-25 08:00', content: '**心電図 (EKG)**\n- **リズム:** 正常洞調律 78 bpm\n- **所見:** 急性ST上昇やT波陰転なし。' },
        { id: 3, citationId: 3, type: RecordType.LabResult, timestamp: '2023-10-25 08:15', content: '**心筋酵素 (1回目)**\n- **トロポニンI:** <0.04 ng/mL (基準値: <0.04) (陰性)\n\n**基礎代謝パネル (BMP)**\n- **ナトリウム:** 140 mEq/L (基準値: 136-145)\n- **カリウム:** 4.1 mEq/L (基準値: 3.5-5.1)\n- **クレアチニン:** 0.9 mg/dL (基準値: 0.7-1.3)' },
        { id: 4, citationId: 4, type: RecordType.Medication, timestamp: '2023-10-25 08:30', content: '薬剤: アスピリン\n用法: 324mg 経口 1回\n状態: 救急外来で投与済み\n適応: 急性胸痛プロトコル' },
        { id: 5, citationId: 5, type: RecordType.ProgressNote, timestamp: '2023-10-25 10:00', content: '観察および連続酵素モニタリングのため遠隔測定ユニットに入院。アスピリン投与後、痛みは2/10に軽減したと報告。' },
        { id: 6, citationId: 6, type: RecordType.LabResult, timestamp: '2023-10-25 14:15', content: '**心筋酵素 (2回目)**\n- **トロポニンI:** <0.04 ng/mL (基準値: <0.04) (陰性)' },
        { id: 7, citationId: 7, type: RecordType.NurseNote, timestamp: '2023-10-25 16:00', content: '患者は快適に休息中。胸痛の訴えはなし。遠隔測定では正常洞調律。コールベルの使用方法について指導。' },
        { id: 8, citationId: 8, type: RecordType.LabResult, timestamp: '2023-10-25 20:15', content: '**心筋酵素 (3回目)**\n- **トロポニンI:** <0.04 ng/mL (基準値: <0.04) (陰性)' },
        { id: 9, citationId: 9, type: RecordType.ProgressNote, timestamp: '2023-10-26 08:30', content: '夜間は無症状。連続トロポニン陰性で、急性心筋梗塞は除外。患者は気分良好。リスク層別化のため心臓病科にコンサルト予定。' },
        { id: 10, citationId: 10, type: RecordType.Medication, timestamp: '2023-10-26 09:00', content: '薬剤: リシノプリル\n用法: 10mg 経口 1日1回\n開始日: 2023-10-26\n状態: 有効\n適応: 血圧管理\n---\n薬剤: アトルバスタチン\n用法: 40mg 経口 就寝前\n開始日: 2023-10-26\n状態: 有効\n適応: 高脂血症' },
        { id: 11, citationId: 11, type: RecordType.ProgressNote, timestamp: '2023-10-26 11:00', content: '心臓病科コンサルト: ACS除外に同意。低リスクスコア。2週間以内に外来で核医学ストレステストを推奨。スタチン療法を開始。心臓病科の観点から退院許可。' },
        { id: 12, citationId: 12, type: RecordType.NurseNote, timestamp: '2023-10-26 15:00', content: '患者は息切れや胸痛なく廊下を歩行。退院計画進行中。新規薬剤について指導。' },
    ],
    2: [ // 安藤京香, 敗血症性ショック
        { id: 13, citationId: 1, type: RecordType.ProgressNote, timestamp: '2023-10-27 05:15', content: '救急外来メモ: 31歳女性、発熱、錯乱、著しい低血圧（血圧75/40）で来院。頻脈（130台）。敗血症性ショックの疑い。輸液蘇生と広域抗生物質を開始。ICUへの転送を開始。' },
        { id: 14, citationId: 2, type: RecordType.LabResult, timestamp: '2023-10-27 05:30', content: '**動脈血ガス (ABG)**\n- **pH:** 7.28 (基準値: 7.35-7.45) (低)\n- **pCO2:** 32 mmHg (基準値: 35-45) (低)\n- **乳酸値:** 5.1 mmol/L (基準値: <2.0) (高)\n\n**全血球計算 (CBC)**\n- **白血球:** 18.5 10*3/uL (基準値: 4.3-10.8) (高)\n- **血小板:** 95 10*3/uL (基準値: 150-450) (低)\n\n**微生物学**\n- **血液培養:** 2回採取、結果待ち。' },
        { id: 15, citationId: 3, type: RecordType.Medication, timestamp: '2023-10-27 06:00', content: '薬剤: ノルエピネフリン\n用法: MAP > 65 mmHgを目標に調整、IV持続点滴\n開始日: 2023-10-27\n状態: 有効\n適応: 敗血症性ショックに対する昇圧サポート\n---\n薬剤: バンコマイシン\n用法: 薬局プロトコルに従う、IV\n開始日: 2023-10-27\n状態: 有効\n適応: 広域抗生物質\n---\n薬剤: ゾシン (ピペラシリン/タゾバクタム)\n用法: 薬局プロトコルに従う、IV\n開始日: 2023-10-27\n状態: 有効\n適応: 広域抗生物質' },
        { id: 16, citationId: 4, type: RecordType.ProgressNote, timestamp: '2023-10-27 07:00', content: 'ICU入室メモ: 意識変容のため気道確保のため挿管。中心静脈ラインと動脈ラインを留置。輸液蘇生と昇圧サポートを継続。診断: 敗血症性ショック、原因不明。' },
        { id: 17, citationId: 5, type: RecordType.NurseNote, timestamp: '2023-10-27 12:00', content: '患者は依然として重篤な状態。ノルエピネフリンの必要量が増加。3LのIV輸液にもかかわらず尿量はごくわずか。プロポフォール持続点滴で鎮静中。' },
        { id: 18, citationId: 6, type: RecordType.ProgressNote, timestamp: '2023-10-28 09:00', content: '夜間、急性腎障害を発症（クレアチニン2.5）。昇圧剤投与は継続。治療を調整するため血液培養の結果を待っている。家族には厳しい予後について説明済み。' },
        { id: 19, citationId: 7, type: RecordType.LabResult, timestamp: '2023-10-29 07:30', content: '**微生物学 - 血液培養 (最終)**\n- **菌種:** 黄色ブドウ球菌 (MSSA)\n- **感受性:** ナフシリン、オキサシリンに感受性あり' },
        { id: 20, citationId: 8, type: RecordType.ProgressNote, timestamp: '2023-10-29 10:00', content: '感染症科コンサルト: 血液培養でMSSA陽性。抗生物質のデエスカレーションを推奨。バンコマイシン/ゾシンを中止し、ナフシリンを開始。感染源は心内膜炎または皮膚/軟部組織感染の可能性が高い。' },
        { id: 21, citationId: 9, type: RecordType.Medication, timestamp: '2023-10-29 11:00', content: '薬剤: ナフシリン\n用法: 薬局プロトコルに従う、IV\n開始日: 2023-10-29\n状態: 有効\n適応: MSSA菌血症\n---\n薬剤: バンコマイシン\n状態: 中止\n---\n薬剤: ゾシン (ピペラシリン/タゾバクタム)\n状態: 中止' },
        { id: 22, citationId: 10, type: RecordType.NurseNote, timestamp: '2023-10-29 18:00', content: 'ナフシリンへの切り替え後、昇圧剤の必要量が減少し始めている。患者は鎮静・換気状態が続いているが、血行動態は改善の兆しを見せている。' },
    ],
    3: [ // 高橋啓介, 胸痛の観察
        { id: 23, citationId: 1, type: RecordType.ProgressNote, timestamp: '2023-10-27 10:45', content: '70歳男性、断続的で非放散性の胸圧で救急外来に来院。2日前に発症し、一度に数分間続く。急性の苦痛なし。バイタル安定。' },
        { id: 24, citationId: 2, type: RecordType.LabResult, timestamp: '2023-10-27 11:00', content: '**心筋酵素 (1回目)**\n- **トロポニンI:** <0.04 ng/mL (陰性)\n\n**心電図 (EKG)**\n- **所見:** 急性の虚血性変化なし。' },
        { id: 25, citationId: 3, type: RecordType.ProgressNote, timestamp: '2023-10-27 11:15', content: '患者のHEARTスコアは3。低リスクだが、年齢と症状の性質を考慮し、ACSを確実に除外するため、連続トロポニンのため観察入院とする。' },
        { id: 26, citationId: 4, type: RecordType.NurseNote, timestamp: '2023-10-27 12:30', content: '患者は観察ユニットに落ち着いた。現在の胸痛の訴えはなし。不安そうな様子。安心させ、治療計画を説明。' },
        { id: 27, citationId: 5, type: RecordType.Medication, timestamp: '2023-10-27 13:00', content: '薬剤: ニトログリセリン\n用法: 0.4mg SL PRN 胸痛時\n開始日: 2023-10-27\n状態: 有効\n適応: 胸痛' },
        { id: 28, citationId: 6, type: RecordType.LabResult, timestamp: '2023-10-27 17:00', content: '**心筋酵素 (2回目)**\n- **トロポニンI:** <0.04 ng/mL (陰性)' },
        { id: 29, citationId: 7, type: RecordType.NurseNote, timestamp: '2023-10-28 08:00', content: '患者は安らかな夜を過ごした。夜間に胸痛の訴えはなく、PRNニトログリセリンは必要なかった。朝の回診のため心臓病科チームを待っている。' },
        { id: 30, citationId: 8, type: RecordType.ProgressNote, timestamp: '2023-10-28 09:30', content: '連続酵素陰性。心電図変化なし。痛みは解消。これは非心臓性胸痛と最も一致していました。患者は外来でのストレステストのため、厳密なプライマリケアと心臓病科のフォローアップで退院可能です[8]。' },
    ],
    4: [ // 伊藤さくら, 頸部捻挫を伴うMVA
        { id: 31, citationId: 1, type: RecordType.ProgressNote, timestamp: '2023-10-19 09:30', content: '救急外来担当医メモ: 22歳女性、低速MVAでシートベルト着用の運転手。後頸部痛とこわばりを訴える。意識消失なし。GCS 15。正中線を触診しても頸椎に圧痛なし。画像検査のNEXUS基準を満たす。' },
        { id: 32, citationId: 2, type: RecordType.LabResult, timestamp: '2023-10-19 10:15', content: '**放射線科レポート - CT頸椎**\n- **所見:** 急性の骨折や不正列なし。\n\n**放射線科レポート - CT頭部**\n- **所見:** 急性の頭蓋内出血の証拠なし。' },
        { id: 33, citationId: 3, type: RecordType.NurseNote, timestamp: '2023-10-19 11:00', content: '患者は意識清明×4。5/10の首と背中の上部の痛みを訴える。四肢は良好な筋力で動かせる。疼痛管理と観察のため入院。' },
        { id: 34, citationId: 4, type: RecordType.Medication, timestamp: '2023-10-19 11:30', content: 'Medication: イブプロフェン\n用法: 600mg 経口 6時間ごと PRN 疼痛時\n開始日: 2023-10-19\nStatus: 有効\n適応: 疼痛管理\n---\nMedication: シクロベンザプリン\n用法: 5mg 経口 1日3回 PRN 筋けいれん時\n開始日: 2023-10-19\nStatus: 有効\n適応: 筋けいれん' },
        { id: 35, citationId: 5, type: RecordType.ProgressNote, timestamp: '2023-10-20 09:00', content: '夜間、患者はイブプロフェン2回、シクロベンザプリン1回を必要とした。痛みは現在3/10。神経学的検査は安定。評価と運動を提供するため、理学療法コンサルトを指示する。' },
        { id: 36, citationId: 6, type: RecordType.ProgressNote, timestamp: '2023-10-20 11:30', content: '理学療法評価メモ: 患者は、頸部捻挫と一致する痛みとけいれんによる頸部可動域制限を呈する。筋力と感覚は正常。穏やかなストレッチ、姿勢、温冷罨法の使用について指導。患者は良好な理解を示した。' },
        { id: 37, citationId: 7, type: RecordType.NurseNote, timestamp: '2023-10-20 16:00', content: '患者は問題なく歩行。経口薬で痛みが十分にコントロールされていると報告。今夜退院予定。理学療法士から在宅運動プログラムの印刷物を提供。' },
        { id: 38, citationId: 8, type: RecordType.ProgressNote, timestamp: '2023-10-20 17:00', content: '退院サマリーメモ: 患者は退院可能。MVAによる頸部捻挫の診断。イブプロフェンとシクロベンザプリンの処方箋を薬局に送信。1週間後に主治医とフォローアップするように指示。再診の注意点も確認済み。' },
    ],
};

export const DOCUMENT_TYPE_TRANSLATIONS: { [key in DocumentType]: string } = {
  [DocumentType.MDHandoff]: '医師による患者引き継ぎ',
  [DocumentType.NurseHandoff]: '看護師による引き継ぎ',
  [DocumentType.DischargeSummaryDiagnosesPlan]: '退院要約と診断/計画',
};
