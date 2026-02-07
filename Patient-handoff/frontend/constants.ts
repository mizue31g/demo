import { Patient, HandoffDocument, PatientRecord, RecordType, DocumentType, Slide } from './types';

export const MOCK_PATIENTS: Patient[] = [
  { id: 1, name: 'John Doe', mrn: 'MRN001', dob: '1985-05-15', location: 'Room 301', status: 'Pending Discharge', age: 39, gender: 'M', encounterId: 'ENC12345', admittedAt: '2023-10-25 07:30' },
  { id: 2, name: 'Jane Smith', mrn: 'MRN002', dob: '1992-08-22', location: 'ICU-2', status: 'Inpatient', age: 31, gender: 'F', encounterId: 'ENC67890', admittedAt: '2023-10-27 05:00' },
  { id: 3, name: 'Robert Brown', mrn: 'MRN003', dob: '1954-01-10', location: 'OBS-4', status: 'Discharged', age: 70, gender: 'M', encounterId: 'ENC11223', admittedAt: '2023-10-27 10:45' },
  { id: 4, name: 'Emily Williams', mrn: 'MRN004', dob: '2001-11-30', location: 'Room 305', status: 'Inpatient', age: 22, gender: 'F', encounterId: 'ENC44556', admittedAt: '2023-10-19 09:15' },
];

const johnDoeDischargeSlides: Slide[] = [
    { title: "Patient Overview", points: ["John Doe, 39 y/o male (MRN: MRN001)", "Admitted 2023-10-25 for substernal chest pressure.", "History clear for CAD.", "Ruled out for Acute Myocardial Infarction."] },
    { title: "Hospital Course", points: ["Initial presentation: 2 hours of 6/10 chest pain at rest [1].", "EKG showed Normal Sinus Rhythm [2].", "Three sets of cardiac enzymes (Troponin I) were negative [3, 6, 8].", "Pain subsided with Aspirin in ED [4].", "Remained event-free overnight [9]."] },
    { title: "Consultations & Key Findings", points: ["Cardiology consulted, low risk score [11].", "Agreed with ACS rule out.", "No acute cardiac pathology identified."] },
    { title: "Discharge Plan", points: ["Discharged in stable condition.", "New medications: Lisinopril for BP, Atorvastatin for hyperlipidemia [10].", "Follow-up: Outpatient nuclear stress test within 2 weeks [11].", "Patient educated on new medications and follow-up plan [12]."] }
];

const janeSmithHandoffSlides: Slide[] = [
    { title: "Patient Overview", points: ["Jane Smith, 31 y/o female (MRN: MRN002)", "Admitted 2023-10-27 from ED.", "Diagnosis: Septic Shock, source unclear at admission [1]."] },
    { title: "Situation", points: ["Patient remains critically ill in the ICU.", "Intubated and sedated on Propofol drip [4, 5].", "Requires significant vasopressor support (Norepinephrine) [3, 5]."] },
    { title: "Key Events - Last 24h", points: ["Developed acute kidney injury (Creatinine 2.5) [6].", "Urine output remains minimal despite fluid resuscitation [5].", "Hemodynamically unstable, pressor requirements increasing overnight [5]."] },
    { title: "Anticipated Plan", points: ["Continue vasopressor support, titrate for MAP > 65.", "Await blood culture results to tailor antibiotic therapy [2].", "Monitor renal function closely; may need nephrology consult.", "Family has been updated on guarded prognosis [6]."] }
];

const emilyWilliamsDischargeSlides: Slide[] = [
    { title: "Patient Overview", points: ["Emily Williams, 22 y/o female (MRN: MRN004).", "Admitted 2023-10-19 after a low-speed MVA.", "Primary complaint was posterior neck pain and stiffness [1]."] },
    { title: "Key Findings & Course", points: ["CT C-Spine and Head were negative for acute fracture or hemorrhage [2].", "Diagnosis: Cervical Strain secondary to MVA [8].", "Pain managed effectively with Ibuprofen and Cyclobenzaprine [4, 5]."] },
    { title: "Interventions", points: ["Physical Therapy consult completed [6].", "PT provided education on gentle stretching, posture, and use of heat/ice.", "Patient demonstrated good understanding and received home exercise program [7]."] },
    { title: "Discharge Plan", points: ["Discharged in stable condition [8].", "Pain well-controlled on oral medications.", "Prescriptions sent for Ibuprofen and Cyclobenzaprine.", "Follow up with PCP in 1 week. Return precautions reviewed."] }
];

export const MOCK_DOCUMENTS: { [key: number]: HandoffDocument[] } = {
  1: [ // John Doe
    {
      id: 1, documentType: DocumentType.MDHandoff, visitId: 'V12345', format: 'sbar',
      createdAt: '2023-10-25', modifiedAt: '2023-10-25', createdBy: 'Dr. Miller',
      content: `
### SBAR Handoff
**Situation:** John Doe is a 39 y/o male admitted from the ED this morning for observation after presenting with substernal chest pain [1].
**Background:** Patient has no prior history of CAD. Presented with 2 hours of 6/10 chest pressure. He received 324mg Aspirin in the ED [4]. His pain has since improved to 2/10 [5].
**Assessment:** Initial EKG showed normal sinus rhythm with no ischemic changes [2]. First set of cardiac enzymes was negative for Troponin I [3]. Vitals are stable. Currently resting comfortably in the telemetry unit.
**Recommendation:** Continue monitoring on telemetry. Obtain serial cardiac enzymes at 14:15 and 20:15 as per protocol. Okay for a regular diet.
`
    },
    {
      id: 2, documentType: DocumentType.DischargeSummaryDiagnosesPlan, visitId: 'V12345',
      createdAt: '2023-10-26', modifiedAt: '2023-10-26', createdBy: 'Dr. Johnson',
      slides: johnDoeDischargeSlides,
      content: `
### Discharge Summary
**Admission Date:** 2023-10-25 **Discharge Date:** 2023-10-26 **Primary Diagnosis:** Chest Pain, atypical

**HOSPITAL COURSE:**
The patient is a 39-year-old male with no significant past medical history who presented to the emergency department with a chief complaint of substernal chest pressure [1]. His initial EKG showed normal sinus rhythm [2], and his initial cardiac enzymes were negative [3]. He was admitted to the telemetry unit for observation and serial enzyme monitoring [5].

Over the course of his admission, two subsequent troponin draws were also negative, ruling out an acute myocardial infarction [6, 8]. The patient remained asymptomatic and hemodynamically stable throughout his stay [7, 9]. Cardiology was consulted and recommended an outpatient nuclear stress test and initiation of statin therapy for risk stratification [11].

**CONDITION AT DISCHARGE:**
Stable.

**DISCHARGE MEDICATIONS:**
- Lisinopril 10mg PO QD [10]
- Atorvastatin 40mg PO QHS [10]

**DISCHARGE INSTRUCTIONS:**
- **Follow-up:** Please schedule an appointment with your Primary Care Physician within 1 week. Schedule an outpatient nuclear stress test as recommended by Cardiology.
- **Diet:** Low-sodium, heart-healthy diet.
- **Activity:** No strenuous activity until after stress test.
- **Return Precautions:** Return to the ED immediately for any recurrence of chest pain, shortness of breath, or new concerning symptoms.
`
    }
  ],
  2: [ // Jane Smith
    {
      id: 3, documentType: DocumentType.MDHandoff, visitId: 'V67890', format: 'ipass',
      createdAt: '2023-10-27', modifiedAt: '2023-10-27', createdBy: 'Dr. Chen',
      content: `
### IPASS Handoff
**I - Illness Severity:** The patient is critically ill. Intubated, sedated, and on vasopressors.
**P - Patient Summary:** Jane Smith is a 31 y/o female admitted from the ED with septic shock of unclear etiology [1]. She presented with fever, confusion, and severe hypotension. She was intubated in the ICU for airway protection [4].
**A - Action List:**
- Continue fluid resuscitation.
- Titrate Norepinephrine to maintain MAP > 65 mmHg [3].
- Continue broad-spectrum antibiotics (Vancomycin, Zosyn) [3].
- Monitor labs, including lactate and renal function.
**S - Situation Awareness & Contingency Planning:** High suspicion for sepsis. Blood cultures are pending [2]. Be prepared for worsening hemodynamic instability or end-organ damage. If pressor requirements continue to rise, consider adding a second agent like Vasopressin.
**S - Synthesis by Receiver:** The receiver, Dr. Miller, has reviewed the plan and agrees. Will continue current management and await culture data.
`
    },
    {
      id: 4, documentType: DocumentType.MDHandoff, visitId: 'V67890', format: 'sbar',
      createdAt: '2023-10-28', modifiedAt: '2023-10-28', createdBy: 'Dr. Miller',
      slides: janeSmithHandoffSlides,
      content: `
### SBAR Handoff
**Situation:** This is Jane Smith, 31F in ICU-2 with septic shock.
**Background:** Admitted yesterday for septic shock [1], intubated and started on broad spectrum antibiotics and Norepinephrine [3, 4].
**Assessment:** Patient remains critically ill. Overnight, she developed an acute kidney injury with creatinine rising to 2.5 [6]. She remains on vasopressors and is sedated [5]. Urine output is minimal. We are still awaiting blood culture results to narrow therapy.
**Recommendation:** Continue current supportive care. Follow up on blood culture results urgently. Consider a renal ultrasound if kidney function does not improve. Update family on guarded prognosis.
`
    },
    {
      id: 5, documentType: DocumentType.NurseHandoff, visitId: 'V67890', format: 'sbar',
      createdAt: '2023-10-29', modifiedAt: '2023-10-29', createdBy: 'R.N. Davis',
      content: `
### SBAR Handoff
**Situation:** Jane Smith in ICU-2, status post positive blood cultures.
**Background:** Patient admitted with septic shock [1]. Blood cultures came back positive for MSSA [7].
**Assessment:** Infectious Disease was consulted [8]. Antibiotics were de-escalated to Nafcillin this morning [9]. Since the change, her vasopressor requirements have started to trend down [10]. She remains sedated and ventilated, but hemodynamics are improving.
**Recommendation:** Continue to monitor vitals and wean Norepinephrine as tolerated. Monitor for any signs of reaction to Nafcillin. Continue standard ICU care for a ventilated patient.
`
    }
  ],
  3: [ // Robert Brown
    {
      id: 6, documentType: DocumentType.MDHandoff, visitId: 'V11223', format: 'ipass',
      createdAt: '2023-10-27', modifiedAt: '2023-10-27', createdBy: 'Dr. Chen',
      content: `
### IPASS Handoff
**I - Illness Severity:** Stable.
**P - Patient Summary:** Robert Brown is a 70 y/o male admitted to the observation unit for rule-out ACS [3]. He presented with intermittent, non-exertional chest pressure [1].
**A - Action List:**
- Await second set of cardiac enzymes at 17:00.
- Continue monitoring.
- PRN Nitroglycerin is available for chest pain [5].
**S - Situation Awareness & Contingency Planning:** HEART score is 3, indicating low risk [3]. First troponin and EKG were negative [2]. If second troponin is negative and patient remains pain-free, he will be a candidate for discharge in the morning. If pain returns or enzymes are positive, will convert to inpatient and consult cardiology.
**S - Synthesis by Receiver:** Dr. Johnson has reviewed the plan. Will check labs and re-evaluate in the evening.
`
    },
    {
      id: 7, documentType: DocumentType.DischargeSummaryDiagnosesPlan, visitId: 'V11223',
      createdAt: '2023-10-28', modifiedAt: '2023-10-28', createdBy: 'Dr. Johnson',
      content: `
### Discharge Summary
**Admission Date:** 2023-10-27 **Discharge Date:** 2023-10-28 **Primary Diagnosis:** Non-cardiac chest pain

**HOSPITAL COURSE:**
The patient is a 70-year-old male who was admitted to the observation unit for evaluation of intermittent chest pressure [1, 3]. His initial workup, including an EKG and cardiac enzymes, was negative for any acute cardiac process [2]. He was monitored overnight and had a second set of troponins which were also negative [6].
The patient remained pain-free throughout his observation period and did not require any PRN nitroglycerin [7]. The clinical picture was most consistent with non-cardiac chest pain. He is stable for discharge [8].

**CONDITION AT DISCHARGE:**
Stable. Asymptomatic.

**DISCHARGE MEDICATIONS:**
No new medications started.

**DISCHARGE INSTRUCTIONS:**
- **Follow-up:** Please follow up with your primary care provider this week to discuss these results and the need for any outpatient cardiac testing.
- **Return Precautions:** Return to the hospital for any worsening or recurrent chest pain, shortness of breath, or dizziness.
`
    }
  ],
  4: [ // Emily Williams
    {
      id: 8, documentType: DocumentType.NurseHandoff, visitId: 'V44556', format: 'sbar',
      createdAt: '2023-10-19', modifiedAt: '2023-10-19', createdBy: 'R.N. Patel',
      content: `
### SBAR Handoff
**Situation:** Emily Williams, 22F admitted for observation and pain control after an MVA.
**Background:** Patient was a restrained driver in a low-speed MVA [1]. She complains of neck and upper back pain.
**Assessment:** CT scans of head and C-spine were negative [2]. Patient is alert and oriented, neuro checks are stable. Pain is 5/10, managed with PRN Ibuprofen and Cyclobenzaprine [3, 4]. Moving all extremities well.
**Recommendation:** Continue monitoring neuro status. Administer pain medication as needed and document effectiveness. Encourage gentle mobilization as tolerated.
`
    },
    {
      id: 9, documentType: DocumentType.DischargeSummaryDiagnosesPlan, visitId: 'V44556',
      createdAt: '2023-10-20', modifiedAt: '2023-10-20', createdBy: 'Dr. Johnson',
      slides: emilyWilliamsDischargeSlides,
      content: `
### Discharge Summary
**Admission Date:** 2023-10-19 **Discharge Date:** 2023-10-20 **Primary Diagnosis:** Cervical Strain

**HOSPITAL COURSE:**
The patient is a 22-year-old female who was admitted for observation following a motor vehicle accident [1]. Her chief complaint was neck pain. Imaging of her head and cervical spine was negative for acute injury [2].
Her pain was well-controlled with oral analgesics [5]. She received a consultation from Physical Therapy, who provided education on exercises and conservative management for cervical strain [6]. The patient tolerated ambulation and was deemed stable for discharge [7, 8].

**CONDITION AT DISCHARGE:**
Stable. Pain well-controlled.

**DISCHARGE MEDICATIONS:**
- Ibuprofen 600mg, as needed for pain.
- Cyclobenzaprine 5mg, as needed for muscle spasms.

**DISCHARGE INSTRUCTIONS:**
- **Follow-up:** Follow up with your primary care physician in 1 week.
- **Activity:** Continue with the home exercise program provided by Physical Therapy. Avoid heavy lifting. Use heat or ice as needed for comfort.
- **Return Precautions:** Return to the ED for worsening pain, new numbness or weakness in the arms or legs, or any other new concerning symptoms.
`
    }
  ]
};

export const MOCK_RECORDS: { [key: number]: PatientRecord[] } = {
    1: [ // John Doe, Chest Pain, ruled out for MI
        { id: 1, citationId: 1, type: RecordType.ProgressNote, timestamp: '2023-10-25 07:45', content: 'ED Provider Note: 39 y/o male presents with 2 hours of substernal chest pressure, non-radiating, 6/10 intensity. Onset at rest. Associated with mild SOB. No history of CAD. Vitals stable.' },
        { id: 2, citationId: 2, type: RecordType.LabResult, timestamp: '2023-10-25 08:00', content: '**Electrocardiogram (EKG)**\n- **Rhythm:** Normal Sinus Rhythm at 78 bpm\n- **Findings:** No acute ST-segment elevation or T-wave inversions.' },
        { id: 3, citationId: 3, type: RecordType.LabResult, timestamp: '2023-10-25 08:15', content: '**Cardiac Enzymes (1st Draw)**\n- **Troponin I:** <0.04 ng/mL (Ref: <0.04) (Negative)\n\n**Basic Metabolic Panel (BMP)**\n- **Sodium:** 140 mEq/L (Ref: 136-145)\n- **Potassium:** 4.1 mEq/L (Ref: 3.5-5.1)\n- **Creatinine:** 0.9 mg/dL (Ref: 0.7-1.3)' },
        { id: 4, citationId: 4, type: RecordType.Medication, timestamp: '2023-10-25 08:30', content: 'Medication: Aspirin\nDirections: 324mg PO once\nStatus: Administered in ED\nIndications: Acute Chest Pain Protocol' },
        { id: 5, citationId: 5, type: RecordType.ProgressNote, timestamp: '2023-10-25 10:00', content: 'Admitted to telemetry unit for observation and serial enzyme monitoring. Patient reports pain has subsided to 2/10 after Aspirin.' },
        { id: 6, citationId: 6, type: RecordType.LabResult, timestamp: '2023-10-25 14:15', content: '**Cardiac Enzymes (2nd Draw)**\n- **Troponin I:** <0.04 ng/mL (Ref: <0.04) (Negative)' },
        { id: 7, citationId: 7, type: RecordType.NurseNote, timestamp: '2023-10-25 16:00', content: 'Patient resting comfortably. No further complaints of chest pain. Telemetry shows normal sinus rhythm. Educated on call bell use.' },
        { id: 8, citationId: 8, type: RecordType.LabResult, timestamp: '2023-10-25 20:15', content: '**Cardiac Enzymes (3rd Draw)**\n- **Troponin I:** <0.04 ng/mL (Ref: <0.04) (Negative)' },
        { id: 9, citationId: 9, type: RecordType.ProgressNote, timestamp: '2023-10-26 08:30', content: 'Overnight event-free. Serial troponins negative, ruling out acute MI. Patient feels well. Will consult cardiology for risk stratification.' },
        { id: 10, citationId: 10, type: RecordType.Medication, timestamp: '2023-10-26 09:00', content: 'Medication: Lisinopril\nDirections: 10mg PO QD\nStart Date: 2023-10-26\nStatus: Active\nIndications: BP management\n---\nMedication: Atorvastatin\nDirections: 40mg PO QHS\nStart Date: 2023-10-26\nStatus: Active\nIndications: Hyperlipidemia' },
        { id: 11, citationId: 11, type: RecordType.ProgressNote, timestamp: '2023-10-26 11:00', content: 'Cardiology Consult: Agree with ACS rule out. Low risk score. Recommend outpatient nuclear stress test within 2 weeks. Start statin therapy. Cleared for discharge from cardiology standpoint.' },
        { id: 12, citationId: 12, type: RecordType.NurseNote, timestamp: '2023-10-26 15:00', content: 'Patient ambulated in hall without SOB or chest pain. Discharge planning in progress. Provided education on new medications.' },
    ],
    2: [ // Jane Smith, Septic Shock
        { id: 13, citationId: 1, type: RecordType.ProgressNote, timestamp: '2023-10-27 05:15', content: 'ED Note: 31 y/o female presents with fever, confusion, and profound hypotension (BP 75/40). Tachycardic to 130s. Suspected septic shock. Starting fluid resuscitation and broad-spectrum antibiotics. Transfer to ICU initiated.' },
        { id: 14, citationId: 2, type: RecordType.LabResult, timestamp: '2023-10-27 05:30', content: '**Arterial Blood Gas (ABG)**\n- **pH:** 7.28 (Ref: 7.35-7.45) (L)\n- **pCO2:** 32 mmHg (Ref: 35-45) (L)\n- **Lactate:** 5.1 mmol/L (Ref: <2.0) (H)\n\n**Complete Blood Count (CBC)**\n- **WBC:** 18.5 10*3/uL (Ref: 4.3-10.8) (H)\n- **Platelets:** 95 10*3/uL (Ref: 150-450) (L)\n\n**Microbiology**\n- **Blood Cultures:** Drawn x2, results pending.' },
        { id: 15, citationId: 3, type: RecordType.Medication, timestamp: '2023-10-27 06:00', content: 'Medication: Norepinephrine\nDirections: Titrated for MAP > 65 mmHg, IV drip\nStart Date: 2023-10-27\nStatus: Active\nIndications: Vasopressor support for septic shock\n---\nMedication: Vancomycin\nDirections: Per pharmacy protocol, IV\nStart Date: 2023-10-27\nStatus: Active\nIndications: Broad-spectrum antibiotic\n---\nMedication: Zosyn (Piperacillin/Tazobactam)\nDirections: Per pharmacy protocol, IV\nStart Date: 2023-10-27\nStatus: Active\nIndications: Broad-spectrum antibiotic' },
        { id: 16, citationId: 4, type: RecordType.ProgressNote, timestamp: '2023-10-27 07:00', content: 'ICU Admission Note: Patient intubated for airway protection due to altered mental status. Central line and arterial line placed. Continuing fluid resuscitation and vasopressor support. Diagnosis: Septic shock, source unclear.' },
        { id: 17, citationId: 5, type: RecordType.NurseNote, timestamp: '2023-10-27 12:00', content: 'Patient remains critically ill. Norepinephrine requirements are increasing. Urine output is minimal despite 3L IV fluids. Sedation with Propofol drip.' },
        { id: 18, citationId: 6, type: RecordType.ProgressNote, timestamp: '2023-10-28 09:00', content: 'Overnight, patient developed acute kidney injury (Creatinine 2.5). Remains on vasopressors. Awaiting blood culture results to tailor therapy. Family updated on guarded prognosis.' },
        { id: 19, citationId: 7, type: RecordType.LabResult, timestamp: '2023-10-29 07:30', content: '**Microbiology - Blood Culture (Final)**\n- **Organism:** Staphylococcus aureus (MSSA)\n- **Sensitivities:** Susceptible to Nafcillin, Oxacillin' },
        { id: 20, citationId: 8, type: RecordType.ProgressNote, timestamp: '2023-10-29 10:00', content: 'Infectious Disease Consult: Blood cultures positive for MSSA. Recommend de-escalating antibiotics. Discontinue Vancomycin/Zosyn and start Nafcillin. Source is likely endocarditis or skin/soft tissue infection.' },
        { id: 21, citationId: 9, type: RecordType.Medication, timestamp: '2023-10-29 11:00', content: 'Medication: Nafcillin\nDirections: Per pharmacy protocol, IV\nStart Date: 2023-10-29\nStatus: Active\nIndications: MSSA Bacteremia\n---\nMedication: Vancomycin\nStatus: Discontinued\n---\nMedication: Zosyn (Piperacillin/Tazobactam)\nStatus: Discontinued' },
        { id: 22, citationId: 10, type: RecordType.NurseNote, timestamp: '2023-10-29 18:00', content: 'Following switch to Nafcillin, vasopressor requirements have started to decrease. Patient remains sedated and ventilated but showing signs of hemodynamic improvement.' },
    ],
    3: [ // Robert Brown, Observation for Chest Pain
        { id: 23, citationId: 1, type: RecordType.ProgressNote, timestamp: '2023-10-27 10:45', content: '70 y/o male presents to ED with intermittent, non-radiating chest pressure. Onset 2 days ago, lasting minutes at a time. No acute distress. Vitals stable.' },
        { id: 24, citationId: 2, type: RecordType.LabResult, timestamp: '2023-10-27 11:00', content: '**Cardiac Enzymes (1st Draw)**\n- **Troponin I:** <0.04 ng/mL (Negative)\n\n**Electrocardiogram (EKG)**\n- **Findings:** No acute ischemic changes.' },
        { id: 25, citationId: 3, type: RecordType.ProgressNote, timestamp: '2023-10-27 11:15', content: 'Patient has a HEART score of 3. Low-risk, but given age and nature of symptoms, will admit to observation for serial troponins to definitively rule out ACS.' },
        { id: 26, citationId: 4, type: RecordType.NurseNote, timestamp: '2023-10-27 12:30', content: 'Patient settled in observation unit. Reports no current chest pain. Seems anxious. Provided reassurance and explained plan of care.' },
        { id: 27, citationId: 5, type: RecordType.Medication, timestamp: '2023-10-27 13:00', content: 'Medication: Nitroglycerin\nDirections: 0.4mg SL PRN for chest pain\nStart Date: 2023-10-27\nStatus: Active\nIndications: Chest pain' },
        { id: 28, citationId: 6, type: RecordType.LabResult, timestamp: '2023-10-27 17:00', content: '**Cardiac Enzymes (2nd Draw)**\n- **Troponin I:** <0.04 ng/mL (Negative)' },
        { id: 29, citationId: 7, type: RecordType.NurseNote, timestamp: '2023-10-28 08:00', content: 'Patient had a restful night. No complaints of chest pain overnight and did not require any PRN nitroglycerin. Awaiting cardiology team for morning rounds.' },
        { id: 30, citationId: 8, type: RecordType.ProgressNote, timestamp: '2023-10-28 09:30', content: 'Serial enzymes negative. EKG unchanged. Pain resolved. This is consistent with non-cardiac chest pain. Patient is stable for discharge with close primary care and cardiology follow-up for outpatient stress testing.' },
    ],
    4: [ // Emily Williams, MVA with Cervical Strain
        { id: 31, citationId: 1, type: RecordType.ProgressNote, timestamp: '2023-10-19 09:30', content: 'ED Provider Note: 22 y/o female is a restrained driver in a low-speed MVA. Complains of posterior neck pain and stiffness. No loss of consciousness. GCS 15. C-spine is non-tender to palpation over midline. Meets NEXUS criteria for imaging.' },
        { id: 32, citationId: 2, type: RecordType.LabResult, timestamp: '2023-10-19 10:15', content: '**Radiology Report - CT C-Spine**\n- **Impression:** No acute fracture or malalignment.\n\n**Radiology Report - CT Head**\n- **Impression:** No evidence of acute intracranial hemorrhage.' },
        { id: 33, citationId: 3, type: RecordType.NurseNote, timestamp: '2023-10-19 11:00', content: 'Patient alert and oriented x4. Complaining of 5/10 neck and upper back soreness. Moving all extremities with good strength. Admitted for pain control and observation.' },
        { id: 34, citationId: 4, type: RecordType.Medication, timestamp: '2023-10-19 11:30', content: 'Medication: Ibuprofen\nDirections: 600mg PO q6h PRN pain\nStart Date: 2023-10-19\nStatus: Active\nIndications: Pain management\n---\nMedication: Cyclobenzaprine\nDirections: 5mg PO TID PRN muscle spasm\nStart Date: 2023-10-19\nStatus: Active\nIndications: Muscle spasm' },
        { id: 35, citationId: 5, type: RecordType.ProgressNote, timestamp: '2023-10-20 09:00', content: 'Overnight, patient required 2 doses of ibuprofen and 1 dose of cyclobenzaprine. Pain is now 3/10. Neuro checks remain stable. Will order Physical Therapy consult to assess and provide exercises.' },
        { id: 36, citationId: 6, type: RecordType.ProgressNote, timestamp: '2023-10-20 11:30', content: 'Physical Therapy Eval Note: Patient presents with limited cervical ROM due to pain and spasm, consistent with cervical strain. Strength and sensation intact. Provided education on gentle stretching, posture, and use of heat/ice. Patient demonstrated good understanding.' },
        { id: 37, citationId: 7, type: RecordType.NurseNote, timestamp: '2023-10-20 16:00', content: 'Patient ambulating without issues. Reports pain is well-controlled with oral medication. Discharge planned for this evening. Provided with printed home exercise program from PT.' },
        { id: 38, citationId: 8, type: RecordType.ProgressNote, timestamp: '2023-10-20 17:00', content: 'Discharge Summary Note: Patient stable for discharge. Diagnosis of cervical strain secondary to MVA. Prescriptions for ibuprofen and cyclobenzaprine sent to pharmacy. Instructed to follow up with PCP in 1 week. Return precautions reviewed.' },
    ],
};