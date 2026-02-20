import { useState, useMemo } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
  ScatterChart, Scatter, ZAxis, Cell,
  PieChart, Pie,
} from "recharts";

const T = {
  orange:"#ec5924", navy:"#152c65", orangeLight:"#f47349", navyLight:"#1d3d8a",
  bgDefault:"#ffffff", bgPrimary:"#152c65", bgSection:"#f5f7fa", bgCard:"#ffffff",
  textPrimary:"#152c65", textSecondary:"#5a6a85", textOnAction:"#ffffff", textMuted:"#9aa5be",
  borderPrimary:"#d0d9ec", borderLight:"#eef1f8",
  green:"#1aad6b", yellow:"#f5a623", red:"#e53935",
  greenBg:"#e8f7f1", yellowBg:"#fff8ec", redBg:"#fdecea",
};
const GRAD = `linear-gradient(90deg, ${T.orange} 40%, ${T.navy})`;
const GRAD_CARD = `linear-gradient(135deg, ${T.navy} 0%, #1d3d8a 100%)`;

// ─── ข้อมูล PMU ตามโครงสร้างปัจจุบัน (อ้างอิง: แผนด้าน ววน. พ.ศ. 2566-2570 ฉบับปรับปรุง ปีงบ 2569-2570) ───
// มติ ครม. พ.ย. 2568: บพข. + บพค. + บพท. อยู่ในกระบวนการควบรวม แต่ยังรายงานแยกหน่วย
const PMU_DATA = [
  // ─── กลุ่มที่อยู่ในกระบวนการควบรวม (มติ ครม. พ.ย. 2568) ───
  {
    id:"P01", name:"บพข.", shortName:"บพข.",
    fullName:"หน่วยบริหารและจัดการทุนด้านการเพิ่มความสามารถในการแข่งขันของประเทศ",
    mergeGroup:true,
    badge:"🔀 อยู่ในกระบวนควบรวม", badgeColor:"#7c3aed",
    note:"มติ ครม. พ.ย. 2568 — อยู่ระหว่างควบรวมกับ บพค. และ บพท.",
    agent_type:"<3000 project",
    // อ้างอิงแผน ววน. 2566-2570 (ฉบับปรับปรุง 2569-2570)
    stvn:{ strategy:"S1", plans:["P1(BCG สุขภาพ)","P2(BCG เกษตร)","P5(ดิจิทัล/AI)","P7(EV)","P8(IDEs)"], flagship:"F7 พัฒนา IDEs", color:"#2563eb" },
    budget:{
      total:4200000000, withdraw_total:3906000000, refund_total:85000000, balance:294000000,
      withdraw_periods:[
        {period:1,budget_plan:1050000000,withdraw:1050000000},
        {period:2,budget_plan:1050000000,withdraw:1040000000},
        {period:3,budget_plan:1050000000,withdraw:980000000},
        {period:4,budget_plan:1050000000,withdraw:836000000},
      ],
      contract_extension_count:2, contract_extension_status:"ขยายแล้ว",
      status:"ดำเนินการอยู่", reprogramming:120000000,
    },
    milestones:[
      {DeliveredOutput:"โครงการเพิ่มขีดแข่งขัน (IDEs/Startup)",QuantityOutput:150,ActualOutputCount:112,KRType:"โครงการ"},
      {DeliveredOutput:"สิทธิบัตรและ IP",QuantityOutput:80,ActualOutputCount:54,KRType:"ฉบับ"},
      {DeliveredOutput:"บริษัท Spin-off",QuantityOutput:20,ActualOutputCount:11,KRType:"บริษัท"},
    ],
    outputs:[
      {OutputName:"โครงการวิจัยที่สำเร็จ",DeliveryAmount:112,UnitCount:"โครงการ"},
      {OutputName:"สิทธิบัตรที่ยื่น",DeliveryAmount:54,UnitCount:"ฉบับ"},
    ],
    outcomes:[{OutcomeName:"มูลค่าทางเศรษฐกิจ (KR: IDEs รายได้ >1,000M)",OutcomeAmount:2100000000,UnitCount:"บาท"}],
    targetBenef:[{TargetBenefNum:8500,TargetBenefUnitCount:"ผู้ประกอบการ"}],
    leverage:{BudgetGrant:4200000000,InCash:1260000000,InKind:"Lab, อุปกรณ์, พื้นที่ทดสอบ",
      partners:[{OrgName:"กลุ่มบริษัทเอกชน",InCash:800000000},{OrgName:"Startup Ecosystem",InCash:460000000}]},
  },
  {
    id:"P02", name:"บพค.", shortName:"บพค.",
    fullName:"หน่วยบริหารและจัดการทุนด้านการพัฒนากำลังคน และทุนด้านการพัฒนาสถาบันอุดมศึกษา การวิจัยและการสร้างนวัตกรรม",
    mergeGroup:true,
    badge:"🔀 อยู่ในกระบวนควบรวม (กรอบงบ 2569 ประกาศแล้ว)", badgeColor:"#7c3aed",
    note:"มีการประกาศกรอบงบประมาณปี 2569 แล้ว — อยู่ระหว่างควบรวมกับ บพข. และ บพท.",
    agent_type:"<3000 project",
    stvn:{ strategy:"S3 + S4", plans:["P18(Frontier Research)","P19(เทคโนโลยีอนาคต)","P21(กำลังคน ววน.)"], flagship:"F9-F10 Frontier+กำลังคน", color:"#7c3aed" },
    budget:{
      total:1850000000, withdraw_total:1813000000, refund_total:12000000, balance:37000000,
      withdraw_periods:[
        {period:1,budget_plan:462500000,withdraw:462500000},
        {period:2,budget_plan:462500000,withdraw:460000000},
        {period:3,budget_plan:462500000,withdraw:455000000},
        {period:4,budget_plan:462500000,withdraw:435500000},
      ],
      contract_extension_count:1, contract_extension_status:"ขยายแล้ว",
      status:"ดำเนินการอยู่", reprogramming:35000000,
    },
    milestones:[
      {DeliveredOutput:"นักวิจัยที่ได้รับทุน (KR P21)",QuantityOutput:500,ActualOutputCount:476,KRType:"คน"},
      {DeliveredOutput:"หลักสูตร Frontier Research (P18)",QuantityOutput:15,ActualOutputCount:9,KRType:"หลักสูตร"},
      {DeliveredOutput:"ห้องปฏิบัติการที่พัฒนา (P19/P20)",QuantityOutput:25,ActualOutputCount:18,KRType:"แห่ง"},
    ],
    outputs:[
      {OutputName:"นักวิจัยระดับสูง",DeliveryAmount:476,UnitCount:"คน"},
      {OutputName:"ผลงานตีพิมพ์ Q1/Q2",DeliveryAmount:890,UnitCount:"บทความ"},
    ],
    outcomes:[{OutcomeName:"นักวิจัยที่กลับมาทำงานในไทย",OutcomeAmount:312,UnitCount:"คน"}],
    targetBenef:[{TargetBenefNum:476,TargetBenefUnitCount:"นักวิจัย"}],
    leverage:{BudgetGrant:1850000000,InCash:185000000,InKind:"ห้องปฏิบัติการ, อุปกรณ์",
      partners:[{OrgName:"มหาวิทยาลัยชั้นนำ 10 แห่ง",InCash:185000000}]},
  },
  {
    id:"P03", name:"บพท.", shortName:"บพท.",
    fullName:"หน่วยบริหารและจัดการทุนด้านการพัฒนาระดับพื้นที่",
    mergeGroup:true,
    badge:"🔀 อยู่ในกระบวนควบรวม", badgeColor:"#7c3aed",
    note:"มติ ครม. พ.ย. 2568 — อยู่ระหว่างควบรวมกับ บพข. และ บพค.",
    agent_type:"<3000 project",
    stvn:{ strategy:"S2", plans:["P11(ชนบท/ท้องถิ่น)","P13(เมืองน่าอยู่)","P14(ความปลอดภัย)"], flagship:"F8 พัฒนาผู้สูงอายุ+ชุมชน, N21-N24", color:"#059669" },
    budget:{
      total:1150000000, withdraw_total:1012000000, refund_total:18000000, balance:138000000,
      withdraw_periods:[
        {period:1,budget_plan:287500000,withdraw:285000000},
        {period:2,budget_plan:287500000,withdraw:282000000},
        {period:3,budget_plan:287500000,withdraw:268000000},
        {period:4,budget_plan:287500000,withdraw:177000000},
      ],
      contract_extension_count:2, contract_extension_status:"ขยายแล้ว",
      status:"ดำเนินการอยู่", reprogramming:42000000,
    },
    milestones:[
      {DeliveredOutput:"โครงการพัฒนาพื้นที่/ชุมชน (N21-N24)",QuantityOutput:80,ActualOutputCount:58,KRType:"โครงการ"},
      {DeliveredOutput:"ชุมชนท้องถิ่นที่ได้รับการยกระดับ",QuantityOutput:120,ActualOutputCount:89,KRType:"ชุมชน"},
      {DeliveredOutput:"เมืองน่าอยู่ที่พัฒนา (P13)",QuantityOutput:12,ActualOutputCount:8,KRType:"เมือง"},
    ],
    outputs:[
      {OutputName:"โครงการพัฒนาชุมชน/ท้องถิ่น",DeliveryAmount:58,UnitCount:"โครงการ"},
      {OutputName:"นวัตกรรมชุมชน",DeliveryAmount:35,UnitCount:"นวัตกรรม"},
    ],
    outcomes:[{OutcomeName:"ชุมชนที่มีรายได้เพิ่มขึ้น",OutcomeAmount:89,UnitCount:"ชุมชน"}],
    targetBenef:[{TargetBenefNum:250000,TargetBenefUnitCount:"คนในพื้นที่"}],
    leverage:{BudgetGrant:1150000000,InCash:172500000,InKind:"พื้นที่ชุมชน, ภูมิปัญญา, แรงงานท้องถิ่น",
      partners:[{OrgName:"อปท. และชุมชน",InCash:115000000},{OrgName:"ภาคเอกชนพื้นที่",InCash:57500000}]},
  },
  // ─── หน่วยงาน PMU อื่นๆ ───
  {
    id:"P04", name:"วช.", shortName:"วช.",
    fullName:"สำนักงานการวิจัยแห่งชาติ — ดูแลภาพรวมและทุนวิจัยพื้นฐาน/สำคัญของประเทศ",
    mergeGroup:false, badge:"", badgeColor:"", note:"",
    agent_type:">3000 project",
    stvn:{ strategy:"S1+S2+S3", plans:["P9(สังคมสูงวัย)","P10(สุขภาพ)","P15(สิ่งแวดล้อม)","P18(Frontier)","P20(โครงสร้างพื้นฐาน)"], flagship:"ทุนวิจัยพื้นฐานระดับชาติ", color:"#dc2626" },
    budget:{
      total:6800000000, withdraw_total:6392000000, refund_total:520000000, balance:408000000,
      withdraw_periods:[
        {period:1,budget_plan:1700000000,withdraw:1700000000},
        {period:2,budget_plan:1700000000,withdraw:1700000000},
        {period:3,budget_plan:1700000000,withdraw:1700000000},
        {period:4,budget_plan:1700000000,withdraw:1292000000},
      ],
      contract_extension_count:5, contract_extension_status:"ขยายแล้ว",
      status:"มีปัญหา", reprogramming:340000000,
    },
    milestones:[
      {DeliveredOutput:"ทุนวิจัยที่จัดสรร",QuantityOutput:3500,ActualOutputCount:3500,KRType:"ทุน"},
      {DeliveredOutput:"โครงการที่สำเร็จตามกำหนด",QuantityOutput:2800,ActualOutputCount:1540,KRType:"โครงการ"},
      {DeliveredOutput:"บทความวิชาการ Q1-Q4",QuantityOutput:4000,ActualOutputCount:2100,KRType:"บทความ"},
    ],
    outputs:[
      {OutputName:"ทุนวิจัยที่อนุมัติ",DeliveryAmount:3500,UnitCount:"ทุน"},
      {OutputName:"โครงการสำเร็จ",DeliveryAmount:1540,UnitCount:"โครงการ"},
    ],
    outcomes:[{OutcomeName:"นักวิจัยที่ได้รับการพัฒนา",OutcomeAmount:8500,UnitCount:"คน"}],
    targetBenef:[{TargetBenefNum:35000,TargetBenefUnitCount:"คน"}],
    leverage:{BudgetGrant:6800000000,InCash:340000000,InKind:"โครงสร้างพื้นฐานวิจัย",
      partners:[{OrgName:"ภาคเอกชนรวม",InCash:340000000}]},
  },
  {
    id:"P05", name:"สนช.", shortName:"สนช./NIA",
    fullName:"สำนักงานนวัตกรรมแห่งชาติ (NIA) — เน้นด้านธุรกิจและสตาร์ทอัพนวัตกรรม",
    mergeGroup:false, badge:"", badgeColor:"", note:"",
    agent_type:"<3000 project",
    stvn:{ strategy:"S1", plans:["P8(IDEs/F7)","P5(ดิจิทัล/AI)","P13(พื้นที่นวัตกรรมการศึกษา/N23)"], flagship:"F7 พัฒนาและส่งเสริม IDEs", color:"#0891b2" },
    budget:{
      total:1250000000, withdraw_total:1181250000, refund_total:9500000, balance:68750000,
      withdraw_periods:[
        {period:1,budget_plan:312500000,withdraw:312500000},
        {period:2,budget_plan:312500000,withdraw:308000000},
        {period:3,budget_plan:312500000,withdraw:305000000},
        {period:4,budget_plan:312500000,withdraw:255750000},
      ],
      contract_extension_count:1, contract_extension_status:"ขยายแล้ว",
      status:"ดำเนินการอยู่", reprogramming:28000000,
    },
    milestones:[
      {DeliveredOutput:"Startup ที่ได้รับการสนับสนุน",QuantityOutput:200,ActualOutputCount:178,KRType:"ราย"},
      {DeliveredOutput:"นวัตกรรมเชิงพาณิชย์ (IDEs)",QuantityOutput:60,ActualOutputCount:44,KRType:"นวัตกรรม"},
      {DeliveredOutput:"Deal Flow / VC Investment",QuantityOutput:2000000000,ActualOutputCount:1680000000,KRType:"บาท"},
    ],
    outputs:[
      {OutputName:"Startup ที่บ่มเพาะ",DeliveryAmount:178,UnitCount:"ราย"},
      {OutputName:"นวัตกรรมเชิงพาณิชย์",DeliveryAmount:44,UnitCount:"นวัตกรรม"},
    ],
    outcomes:[{OutcomeName:"มูลค่าการลงทุนใน Startup",OutcomeAmount:1680000000,UnitCount:"บาท"}],
    targetBenef:[{TargetBenefNum:12000,TargetBenefUnitCount:"ผู้ประกอบการ"}],
    leverage:{BudgetGrant:1250000000,InCash:875000000,InKind:"Co-working, Mentorship, VC Network",
      partners:[{OrgName:"VC และนักลงทุน",InCash:625000000},{OrgName:"บริษัทเทคโนโลยี",InCash:250000000}]},
  },
  {
    id:"P06", name:"สวก.", shortName:"สวก.",
    fullName:"สำนักงานพัฒนาการวิจัยการเกษตร — เน้นงานวิจัยและนวัตกรรมด้านการเกษตร",
    mergeGroup:false, badge:"", badgeColor:"", note:"",
    agent_type:"<3000 project",
    stvn:{ strategy:"S1+S2", plans:["P2(BCG เกษตรและอาหาร)","P15(สิ่งแวดล้อม/เกษตร)"], flagship:"BCG เกษตร: Functional Food, พันธุ์พืช", color:"#16a34a" },
    budget:{
      total:980000000, withdraw_total:843000000, refund_total:8500000, balance:137000000,
      withdraw_periods:[
        {period:1,budget_plan:245000000,withdraw:240000000},
        {period:2,budget_plan:245000000,withdraw:238000000},
        {period:3,budget_plan:245000000,withdraw:220000000},
        {period:4,budget_plan:245000000,withdraw:145000000},
      ],
      contract_extension_count:3, contract_extension_status:"ขยายแล้ว",
      status:"ดำเนินการอยู่", reprogramming:65000000,
    },
    milestones:[
      {DeliveredOutput:"พันธุ์พืชใหม่ (BCG เกษตร)",QuantityOutput:8,ActualOutputCount:3,KRType:"พันธุ์"},
      {DeliveredOutput:"เทคโนโลยีเกษตร (Functional Food)",QuantityOutput:50,ActualOutputCount:28,KRType:"เทคโนโลยี"},
      {DeliveredOutput:"เกษตรกรได้รับอบรม",QuantityOutput:5000,ActualOutputCount:2850,KRType:"คน"},
    ],
    outputs:[
      {OutputName:"งานวิจัยการเกษตร",DeliveryAmount:28,UnitCount:"โครงการ"},
      {OutputName:"เทคโนโลยีถ่ายทอด",DeliveryAmount:28,UnitCount:"เทคโนโลยี"},
    ],
    outcomes:[{OutcomeName:"รายได้เกษตรกรที่เพิ่มขึ้น",OutcomeAmount:15,UnitCount:"%"}],
    targetBenef:[{TargetBenefNum:2850,TargetBenefUnitCount:"ครัวเรือนเกษตรกร"}],
    leverage:{BudgetGrant:980000000,InCash:98000000,InKind:"พื้นที่ทดลอง, แรงงาน",
      partners:[{OrgName:"สหกรณ์การเกษตร",InCash:45000000},{OrgName:"บริษัทเมล็ดพันธุ์",InCash:53000000}]},
  },
  {
    id:"P07", name:"สวรส.", shortName:"สวรส.",
    fullName:"สถาบันวิจัยระบบสาธารณสุข — เน้นด้านสุขภาพและระบบสาธารณสุข",
    mergeGroup:false, badge:"", badgeColor:"", note:"",
    agent_type:"<3000 project",
    stvn:{ strategy:"S2", plans:["P10(ความมั่นคงสุขภาพ)","P9(สังคมสูงวัย)"], flagship:"F8+N15-N17 ระบบสุขภาพและความมั่นคง", color:"#db2777" },
    budget:{
      total:750000000, withdraw_total:682500000, refund_total:5200000, balance:67500000,
      withdraw_periods:[
        {period:1,budget_plan:187500000,withdraw:187500000},
        {period:2,budget_plan:187500000,withdraw:185000000},
        {period:3,budget_plan:187500000,withdraw:180000000},
        {period:4,budget_plan:187500000,withdraw:130000000},
      ],
      contract_extension_count:1, contract_extension_status:"ขยายแล้ว",
      status:"ดำเนินการอยู่", reprogramming:18000000,
    },
    milestones:[
      {DeliveredOutput:"แนวทางปฏิบัติทางการแพทย์",QuantityOutput:10,ActualOutputCount:8,KRType:"ฉบับ"},
      {DeliveredOutput:"นโยบายสาธารณสุข (N15-N17)",QuantityOutput:5,ActualOutputCount:4,KRType:"นโยบาย"},
      {DeliveredOutput:"โครงการวิจัยสุขภาพ",QuantityOutput:60,ActualOutputCount:53,KRType:"โครงการ"},
    ],
    outputs:[
      {OutputName:"รายงานวิจัยสุขภาพ",DeliveryAmount:53,UnitCount:"ฉบับ"},
      {OutputName:"บทความวิชาการ",DeliveryAmount:142,UnitCount:"บทความ"},
    ],
    outcomes:[{OutcomeName:"ประชาชนที่ได้รับประโยชน์",OutcomeAmount:500000,UnitCount:"คน"}],
    targetBenef:[{TargetBenefNum:500000,TargetBenefUnitCount:"คน"}],
    leverage:{BudgetGrant:750000000,InCash:112500000,InKind:"บุคลากร, อุปกรณ์การแพทย์",
      partners:[{OrgName:"โรงพยาบาลเครือข่าย",InCash:75000000},{OrgName:"บริษัทยา",InCash:37500000}]},
  },
  {
    id:"P08", name:"สถาบันวัคซีนฯ", shortName:"สถาบันวัคซีนแห่งชาติ",
    fullName:"สถาบันวัคซีนแห่งชาติ — เฉพาะทางด้านวัคซีนและการเสริมสร้างความมั่นคงทางสุขภาพ",
    mergeGroup:false, badge:"", badgeColor:"", note:"",
    agent_type:"<650 project",
    stvn:{ strategy:"S1", plans:["P1(BCG สุขภาพ)","F1(วัคซีน)"], flagship:"F1 พัฒนาและผลิตวัคซีนสำหรับโรคสำคัญ — KR1-KR7 P1", color:"#0891b2" },
    budget:{
      total:420000000, withdraw_total:394800000, refund_total:2100000, balance:25200000,
      withdraw_periods:[
        {period:1,budget_plan:105000000,withdraw:105000000},
        {period:2,budget_plan:105000000,withdraw:103000000},
        {period:3,budget_plan:105000000,withdraw:101500000},
        {period:4,budget_plan:105000000,withdraw:85300000},
      ],
      contract_extension_count:0, contract_extension_status:"ไม่มี",
      status:"ดำเนินการอยู่", reprogramming:0,
    },
    milestones:[
      {DeliveredOutput:"วัคซีนต้นแบบ (KR1-KR2 F1)",QuantityOutput:5,ActualOutputCount:4,KRType:"ชนิด"},
      {DeliveredOutput:"ถ่ายทอดเทคโนโลยีวัคซีน (KR F1)",QuantityOutput:3,ActualOutputCount:3,KRType:"โครงการ"},
      {DeliveredOutput:"ผู้เชี่ยวชาญวัคซีน (KR3 F1: เป้า 300 คน)",QuantityOutput:150,ActualOutputCount:138,KRType:"คน"},
    ],
    outputs:[
      {OutputName:"วัคซีนต้นแบบ",DeliveryAmount:4,UnitCount:"ชนิด"},
      {OutputName:"รายงานวิจัยวัคซีน",DeliveryAmount:18,UnitCount:"ฉบับ"},
    ],
    outcomes:[{OutcomeName:"ความสามารถผลิตวัคซีนในประเทศ",OutcomeAmount:85,UnitCount:"%"}],
    targetBenef:[{TargetBenefNum:70000000,TargetBenefUnitCount:"คน (ประชากรไทย)"}],
    leverage:{BudgetGrant:420000000,InCash:126000000,InKind:"ห้องปฏิบัติการ BSL-3, อุปกรณ์",
      partners:[{OrgName:"WHO และองค์กรระหว่างประเทศ",InCash:84000000},{OrgName:"บริษัทเภสัชกรรม",InCash:42000000}]},
  },
  {
    id:"P09", name:"TCELS", shortName:"TCELS",
    fullName:"ศูนย์ความเป็นเลิศด้านชีววิทยาศาสตร์ (ศลช.) — อุตสาหกรรมชีววิทยาศาสตร์และเทคโนโลยีการแพทย์",
    mergeGroup:false, badge:"", badgeColor:"", note:"",
    agent_type:"<3000 project",
    stvn:{ strategy:"S1", plans:["P1(BCG สุขภาพ)","N2(ยา/สมุนไพร)","N3(ATMPs/เครื่องมือแพทย์)"], flagship:"ATMPs, ชีววัตถุ, Genomics — KR3-KR5 P1", color:"#9333ea" },
    budget:{
      total:680000000, withdraw_total:625600000, refund_total:4800000, balance:54400000,
      withdraw_periods:[
        {period:1,budget_plan:170000000,withdraw:170000000},
        {period:2,budget_plan:170000000,withdraw:168000000},
        {period:3,budget_plan:170000000,withdraw:163000000},
        {period:4,budget_plan:170000000,withdraw:124600000},
      ],
      contract_extension_count:1, contract_extension_status:"ขยายแล้ว",
      status:"ดำเนินการอยู่", reprogramming:22000000,
    },
    milestones:[
      {DeliveredOutput:"ผลิตภัณฑ์ ATMPs/ชีววิทยาศาสตร์ (KR3 P1: เป้า 2,000M)",QuantityOutput:25,ActualOutputCount:19,KRType:"ผลิตภัณฑ์"},
      {DeliveredOutput:"บริษัท Life Sciences ที่สนับสนุน",QuantityOutput:40,ActualOutputCount:35,KRType:"บริษัท"},
      {DeliveredOutput:"การทดลองทางคลินิก / Genomics (KR4 P1)",QuantityOutput:12,ActualOutputCount:9,KRType:"โครงการ"},
    ],
    outputs:[
      {OutputName:"ผลิตภัณฑ์เชิงพาณิชย์",DeliveryAmount:19,UnitCount:"ผลิตภัณฑ์"},
      {OutputName:"สิทธิบัตรด้านชีววิทยาศาสตร์",DeliveryAmount:22,UnitCount:"ฉบับ"},
    ],
    outcomes:[{OutcomeName:"มูลค่าอุตสาหกรรม Life Sciences",OutcomeAmount:3200000000,UnitCount:"บาท"}],
    targetBenef:[{TargetBenefNum:5000,TargetBenefUnitCount:"ผู้ป่วยและผู้ใช้ผลิตภัณฑ์"}],
    leverage:{BudgetGrant:680000000,InCash:476000000,InKind:"เครื่องมือวิทยาศาสตร์, Clinical site",
      partners:[{OrgName:"บริษัทเภสัชและ MedTech",InCash:340000000},{OrgName:"โรงพยาบาลวิจัย",InCash:136000000}]},
  },
];

// ── P0: Relevance Score — อ้างอิง ADB PPER-PSO Criterion 1: Relevance ──
// วัดว่า PMU นั้นสอดคล้องกับนโยบายแผนด้าน ววน. 2566-2570 มากน้อยแค่ไหน
function computeRelevance(p) {
  const sv = p.stvn;
  if (!sv) return 50;

  // 1. Strategy breadth: ครอบคลุมกี่ยุทธศาสตร์ (S1–S4)
  const strategies = sv.strategy.split("+").length;
  const breadthScore = Math.min(40, strategies * 20); // S1=20, S1+S2=40

  // 2. Number of plans/programs responsible (each plan = +8, max 40)
  const planCount = sv.plans?.length || 0;
  const planScore = Math.min(40, planCount * 8);

  // 3. Flagship presence — มี Flagship ที่ชัดเจน = +15
  const flagshipScore = sv.flagship && sv.flagship.length > 5 ? 15 : 5;

  // 4. Merge group bonus — หน่วยควบรวมมี cross-cutting relevance สูงกว่า = +5
  const mergeBonus = p.mergeGroup ? 5 : 0;

  const raw = breadthScore + planScore + flagshipScore + mergeBonus;
  return Math.min(100, raw);
}

function computeScores(p) {
  // P0: Relevance (ADB Criterion 1)
  const p0=computeRelevance(p);

  // P1: Budget Efficiency (ADB Criterion 3 — Efficiency)
  const utilRate=p.budget.withdraw_total/p.budget.total;
  const refundRate=p.budget.refund_total/p.budget.total;
  const reprRate=p.budget.reprogramming/p.budget.total;
  const p1=Math.min(100,Math.max(0,Math.round(utilRate*100-refundRate*50-reprRate*50)));

  // P2: Milestone Delivery (ADB Criterion 2 — Effectiveness, output level)
  const mRates=p.milestones.map(m=>m.QuantityOutput>0?m.ActualOutputCount/m.QuantityOutput:1);
  const p2=Math.round((mRates.reduce((a,b)=>a+b,0)/mRates.length)*100);

  // P3: Contract Health (ADB Criterion 4 — Sustainability proxy)
  const extPenalty=Math.min(50,p.budget.contract_extension_count*10);
  const statusScore=p.budget.status==="ปิดแล้ว"?100:p.budget.status==="ดำเนินการอยู่"?70:30;
  const p3=Math.max(0,statusScore-extPenalty);

  // P4: Output Quality (ADB Criterion 2 — Effectiveness, outcome level)
  const bNum=p.targetBenef[0]?.TargetBenefNum||0;
  const p4=Math.min(100,Math.round((bNum/(p.budget.total/100000000))*2));

  // P5: Leverage (ADB Additionality / Sustainability of financing)
  const p5=Math.min(100,Math.round((p.leverage.InCash/p.leverage.BudgetGrant)*200));

  // Weighted Final — รวม 6 pillars (ADB-aligned weights)
  // P0 Relevance 10% | P1 Efficiency 22% | P2 Effectiveness 28% |
  // P3 Sustainability 18% | P4 Output 12% | P5 Leverage 10%
  const final=Math.round(p0*0.10+p1*0.22+p2*0.28+p3*0.18+p4*0.12+p5*0.10);

  // ADB PPER sub-criterion composites (for PPER report tab)
  const relevance = p0;
  const effectiveness = Math.round(p2*0.60+p4*0.40);   // milestone + output
  const efficiency = p1;                                  // budget execution
  const sustainability = Math.round(p3*0.55+p5*0.45);   // contract + leverage

  return {p0,p1,p2,p3,p4,p5,final,relevance,effectiveness,efficiency,sustainability};
}

const fmt=n=>n>=1e9?(n/1e9).toFixed(2)+"B":n>=1e6?(n/1e6).toFixed(1)+"M":n.toLocaleString();
const fmtM=n=>n>=1e9?(n/1e9).toFixed(2)+" B":n>=1e6?(n/1e6).toFixed(1)+" M":n.toLocaleString()+" บาท";
const pct=n=>(n*100).toFixed(1)+"%";

// ADB PPER 4-point rating scale (อ้างอิง ADB Guidelines for Evaluation of Public Sector Operations)
const scoreInfo=s=>s>=85
  ?{color:"#16a34a",bg:"#dcfce7",border:"#86efac",label:"Highly Successful",short:"HS",adb:"Highly Successful"}
  :s>=65
  ?{color:"#2563eb",bg:"#dbeafe",border:"#93c5fd",label:"Successful",short:"S",adb:"Successful"}
  :s>=50
  ?{color:"#d97706",bg:"#fef3c7",border:"#fcd34d",label:"Partially Successful",short:"PS",adb:"Partially Successful"}
  :{color:"#dc2626",bg:"#fee2e2",border:"#fca5a5",label:"Unsuccessful",short:"U",adb:"Unsuccessful"};

// ADB criterion-level rating (same scale, different labels)
const criterionRating=s=>s>=85
  ?{label:"Highly Satisfactory",color:"#16a34a",bg:"#dcfce7",border:"#86efac"}
  :s>=65
  ?{label:"Satisfactory",color:"#2563eb",bg:"#dbeafe",border:"#93c5fd"}
  :s>=50
  ?{label:"Partly Satisfactory",color:"#d97706",bg:"#fef3c7",border:"#fcd34d"}
  :{label:"Unsatisfactory",color:"#dc2626",bg:"#fee2e2",border:"#fca5a5"};

const PILLARS=[
  {key:"p0",label:"Relevance",        icon:"🎯",w:"10%",color:"#7c3aed",api:"stvn[]",adbCrit:"Criterion 1"},
  {key:"p1",label:"Budget Execution", icon:"💰",w:"22%",color:"#3b82f6",api:"/tsriis-report-withdraw",adbCrit:"Criterion 3"},
  {key:"p2",label:"Milestone Delivery",icon:"📌",w:"28%",color:"#f97316",api:"/milestone",adbCrit:"Criterion 2"},
  {key:"p3",label:"Contract Health",  icon:"📋",w:"18%",color:"#152c65",api:"/tsriis-report-withdraw",adbCrit:"Criterion 4"},
  {key:"p4",label:"Output Quality",   icon:"📈",w:"12%",color:"#16a34a",api:"/milestone",adbCrit:"Criterion 2"},
  {key:"p5",label:"Leverage",         icon:"🤝",w:"10%",color:"#8b5cf6",api:"/in-cash-inkind",adbCrit:"Criterion 4"},
];

export default function Dashboard() {
  const [selected,setSelected]=useState("P01");
  const [tab,setTab]=useState("overview");
  const enriched=useMemo(()=>PMU_DATA.map(p=>({...p,scores:computeScores(p)})),[]);
  const sel=enriched.find(p=>p.id===selected);
  const si=scoreInfo(sel.scores.final);
  const radarData=PILLARS.map(m=>({subject:m.label.split(" ")[0],value:sel.scores[m.key],fullMark:100}));
  const withdrawLine=sel.budget.withdraw_periods.map(w=>({name:`งวด ${w.period}`,แผน:Math.round(w.budget_plan/1e6),จริง:Math.round(w.withdraw/1e6)}));
  const msData=sel.milestones.map(m=>({name:m.DeliveredOutput.length>12?m.DeliveredOutput.slice(0,12)+"...":m.DeliveredOutput,fullName:m.DeliveredOutput,target:m.QuantityOutput,actual:m.ActualOutputCount,rate:m.QuantityOutput>0?Math.round((m.ActualOutputCount/m.QuantityOutput)*100):100,KRType:m.KRType}));
  const barAll=enriched.map(p=>({name:p.shortName,fullName:p.name,Final:p.scores.final,id:p.id}));
  const scatter=enriched.map(p=>({x:p.scores.p1,y:p.scores.p2,name:p.shortName,fullName:p.name,final:p.scores.final,id:p.id}));

  // ── TYPE SCALE (อิงจาก TSRI CSS — Body-6=16px, Body-4=18px, Subtitle=24px+)
  // ภาษาไทยต้องการ min 14px เพื่ออ่านสบาย
  const FS={
    xs:"12px",   // label เล็กสุด, monospace API field
    sm:"13px",   // caption, badge, overline
    base:"15px", // body ทั่วไป — Body-6 ของ TSRI (16px scaled)
    md:"16px",   // body เน้น, table cell
    lg:"18px",   // section header, card title
    xl:"20px",   // tab label, sub-header
    "2xl":"24px",// KPI number ขนาดกลาง
    "3xl":"30px",// KPI score ใหญ่
    "4xl":"38px",// Final score
  };

  const s={
    root:{fontFamily:"'DB Heavent','Sarabun','Noto Sans Thai',sans-serif",background:T.bgSection,minHeight:"100vh",color:T.textPrimary,lineHeight:1.5},
    header:{background:T.bgDefault,borderBottom:`1px solid ${T.borderPrimary}`,padding:"0 20px",boxShadow:"0 1px 4px rgba(21,44,101,0.08)"},
    headerRow:{display:"flex",alignItems:"center",justifyContent:"space-between",height:"58px",gap:"12px"},
    gradText:{background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",fontWeight:700,fontSize:FS.xl},
    tabBar:{borderBottom:`1px solid ${T.borderPrimary}`,display:"flex",gap:"2px",padding:"0 20px",background:T.bgDefault},
    tab:(a)=>({display:"flex",alignItems:"center",gap:"6px",padding:"10px 18px",cursor:"pointer",fontWeight:700,fontSize:FS.md,border:"none",background:"transparent",borderBottom:a?`3px solid ${T.orange}`:"3px solid transparent",color:a?T.orange:T.textSecondary,transition:"all .2s"}),
    layout:{display:"flex",height:"calc(100vh - 96px)",overflow:"hidden"},
    sidebar:{width:"192px",flexShrink:0,background:T.bgDefault,borderRight:`1px solid ${T.borderPrimary}`,overflowY:"auto"},
    sideTitle:{padding:"10px 14px",fontSize:FS.sm,fontWeight:700,color:T.textSecondary,borderBottom:`1px solid ${T.borderLight}`,textTransform:"uppercase",letterSpacing:".06em"},
    sideItem:(a)=>({padding:"12px 14px",cursor:"pointer",borderBottom:`1px solid ${T.borderLight}`,borderLeft:a?`3px solid ${T.orange}`:"3px solid transparent",background:a?"#fff5f1":T.bgDefault,transition:"all .15s"}),
    main:{flex:1,overflowY:"auto",padding:"16px"},
    card:{background:T.bgDefault,borderRadius:"10px",border:`1px solid ${T.borderPrimary}`,boxShadow:"0 1px 4px rgba(21,44,101,0.06)"},
    cardHead:{padding:"12px 16px",borderBottom:`1px solid ${T.borderLight}`,fontWeight:700,fontSize:FS.lg,color:T.textPrimary,display:"flex",alignItems:"center",gap:"8px",lineHeight:1.4},
    cardBody:{padding:"14px 16px"},
    kpiCard:{background:GRAD_CARD,borderRadius:"8px",padding:"14px 16px",color:"#fff",boxShadow:"0 2px 8px rgba(21,44,101,0.18)"},
    badge:(si)=>({display:"inline-block",padding:"4px 12px",borderRadius:"5px",background:si.bg,border:`1px solid ${si.border}`,color:si.color,fontWeight:700,fontSize:FS.sm,lineHeight:1.4}),
    th:{padding:"10px 12px",fontSize:FS.sm,fontWeight:700,color:T.textSecondary,borderBottom:`2px solid ${T.borderPrimary}`,textAlign:"left",background:T.bgSection,lineHeight:1.4},
    td:{padding:"11px 12px",fontSize:FS.base,borderBottom:`1px solid ${T.borderLight}`,lineHeight:1.5},
    barTrack:{background:T.borderLight,borderRadius:"99px",height:"7px",flex:1},
    label:{fontSize:FS.xs,color:T.textMuted,fontFamily:"monospace"},
    fieldTag:{fontSize:FS.xs,color:T.textMuted,fontFamily:"monospace",background:T.bgSection,padding:"2px 7px",borderRadius:"4px"},
  };

  const PillarBar=({score})=>{
    const i=scoreInfo(score);
    return <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
      <div style={s.barTrack}><div style={{width:`${score}%`,height:"7px",borderRadius:"99px",background:i.color,transition:"width .4s"}}/></div>
      <span style={{fontSize:FS.sm,fontWeight:700,color:i.color,minWidth:"28px"}}>{score}</span>
    </div>;
  };

  const SectionHead=({icon,title,api})=>(
    <div style={s.cardHead}>
      <span style={{fontSize:FS.lg}}>{icon}</span><span>{title}</span>
      {api&&<span style={{...s.fieldTag,marginLeft:"auto"}}>{api}</span>}
    </div>
  );

  const tooltipStyle={fontFamily:"DB Heavent,Sarabun",fontSize:FS.sm,border:`1px solid ${T.borderPrimary}`,borderRadius:"6px",padding:"8px 12px"};

  return (
    <div style={s.root}>
      {/* HEADER */}
      <div style={s.header}>
        <div style={s.headerRow}>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <div style={{width:"38px",height:"38px",borderRadius:"7px",background:GRAD_CARD,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:"13px"}}>สกสว</div>
            <div>
              <div style={s.gradText}>ระบบประเมินผล PMU — 6 Pillar Model (ADB PPER Framework)</div>
              <div style={{fontSize:FS.sm,color:T.textMuted,marginTop:"2px"}}>สกสว. · ปีงบ 2567 · อ้างอิง ADB Guidelines for Evaluation of Public Sector Operations</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
            <span style={{fontSize:FS.base,color:T.textSecondary}}>PMU ที่เลือก</span>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                <span style={{fontWeight:700,fontSize:FS.lg,color:T.navy}}>{sel.shortName}</span>
                {sel.badge && <span style={{fontSize:"11px",fontWeight:700,color:sel.badgeColor,background:sel.badgeColor+"18",border:`1px solid ${sel.badgeColor}55`,borderRadius:"4px",padding:"2px 8px"}}>{sel.badge}</span>}
                <span style={s.badge(si)}>{si.short} · {sel.scores.final}/100</span>
              </div>
              {sel.note && <div style={{fontSize:FS.xs,color:"#7c3aed",marginTop:"2px"}}>{sel.note}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* TAB BAR */}
      <div style={s.tabBar}>
        {[{k:"overview",l:"📊 ภาพรวม"},{k:"detail",l:"🔍 รายละเอียด"},{k:"matrix",l:"⚡ Matrix เปรียบเทียบ"},{k:"pper",l:"📝 PPER Report"}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} style={s.tab(tab===t.k)}>{t.l}</button>
        ))}
      </div>

      <div style={s.layout}>
          {/* SIDEBAR */}
          <div style={s.sidebar}>
            <div style={s.sideTitle}>PMU ({enriched.length} หน่วย)</div>
            {/* Group label: กลุ่มควบรวม */}
            <div style={{padding:"5px 14px",fontSize:"10px",fontWeight:700,color:"#7c3aed",background:"#f3f0ff",borderBottom:"1px solid #e4d9fa",letterSpacing:".04em"}}>🔀 กลุ่มอยู่ในกระบวนควบรวม (ครม. พ.ย. 68)</div>
            {enriched.filter(p=>p.mergeGroup).map(p=>{
              const a=p.id===selected;
              const psi=scoreInfo(p.scores.final);
              return <div key={p.id} style={{...s.sideItem(a),borderLeft:a?`3px solid #7c3aed`:"3px solid #e4d9fa",background:a?"#faf5ff":T.bgDefault}} onClick={()=>setSelected(p.id)}>
                <div style={{fontWeight:700,fontSize:FS.md,color:a?"#7c3aed":T.navy,lineHeight:1.3}}>{p.shortName}</div>
                <div style={{fontSize:FS.xs,color:"#7c3aed",background:"#f3f0ff",border:"1px solid #d4c5f5",borderRadius:"3px",padding:"1px 5px",display:"inline-block",marginTop:"2px",marginBottom:"4px"}}>ควบรวม</div>
                {PILLARS.map(m=>(
                  <div key={m.key} style={{marginTop:"5px"}}>
                    <div style={{fontSize:FS.xs,color:m.color,marginBottom:"2px",fontWeight:700}}>{m.label.split(" ")[0]}</div>
                    <PillarBar score={p.scores[m.key]}/>
                  </div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"6px"}}>
                  <span style={{fontSize:FS.xs,color:T.textMuted}}>Final</span>
                  <span style={s.badge(psi)}>{p.scores.final}</span>
                </div>
              </div>;
            })}
            {/* Group label: อื่นๆ */}
            <div style={{padding:"5px 14px",fontSize:"10px",fontWeight:700,color:T.textSecondary,background:T.bgSection,borderBottom:`1px solid ${T.borderLight}`,letterSpacing:".04em"}}>หน่วยงาน PMU อื่นๆ</div>
            {enriched.filter(p=>!p.mergeGroup).map(p=>{
              const a=p.id===selected;
              const psi=scoreInfo(p.scores.final);
              return <div key={p.id} style={s.sideItem(a)} onClick={()=>setSelected(p.id)}>
                <div style={{fontWeight:700,fontSize:FS.md,color:a?T.orange:T.navy,lineHeight:1.3}}>{p.shortName}</div>
                <div style={{fontSize:FS.xs,color:T.textMuted,marginTop:"2px",marginBottom:"6px"}}>{p.agent_type}</div>
                {PILLARS.map(m=>(
                  <div key={m.key} style={{marginTop:"5px"}}>
                    <div style={{fontSize:FS.xs,color:m.color,marginBottom:"2px",fontWeight:700}}>{m.label.split(" ")[0]}</div>
                    <PillarBar score={p.scores[m.key]}/>
                  </div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"6px"}}>
                  <span style={{fontSize:FS.xs,color:T.textMuted}}>Final</span>
                  <span style={s.badge(psi)}>{p.scores.final}</span>
                </div>
              </div>;
            })}
          </div>

          {/* MAIN */}
          <div style={s.main}>

            {/* ═══ OVERVIEW ═══ */}
            {tab==="overview" && <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>

            {/* ── ววน. Strategy Reference Banner ── */}
            <div style={{background:"linear-gradient(135deg,#ede9fe 0%,#dbeafe 100%)",borderRadius:"10px",padding:"12px 16px",border:"1px solid #c4b5fd",display:"flex",gap:"16px",alignItems:"flex-start",flexWrap:"wrap"}}>
              <div style={{flex:"0 0 auto"}}>
                <div style={{fontSize:FS.xs,fontWeight:700,color:"#6d28d9",textTransform:"uppercase",letterSpacing:".05em",marginBottom:"4px"}}>📋 แผนด้าน ววน. 2566–2570 (ฉบับปรับปรุง 2569–2570)</div>
                <div style={{fontWeight:700,fontSize:FS.md,color:sel.stvn.color}}>ยุทธศาสตร์: {sel.stvn.strategy}</div>
                <div style={{fontSize:FS.sm,color:"#4c1d95",marginTop:"2px",fontStyle:"italic",lineHeight:1.4}}>{sel.stvn.flagship}</div>
              </div>
              <div style={{flex:1,minWidth:"200px"}}>
                <div style={{fontSize:FS.xs,fontWeight:700,color:"#6d28d9",marginBottom:"6px"}}>แผนงานที่รับผิดชอบ</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                  {sel.stvn.plans.map(pl=>(
                    <span key={pl} style={{background:"#fff",border:`1px solid ${sel.stvn.color}55`,borderRadius:"5px",padding:"3px 10px",fontSize:FS.xs,color:sel.stvn.color,fontWeight:600}}>{pl}</span>
                  ))}
                </div>
              </div>
              {sel.mergeGroup && (
                <div style={{background:"#fff",border:"1px solid #c4b5fd",borderRadius:"8px",padding:"8px 12px",fontSize:FS.xs,color:"#7c3aed",lineHeight:1.6}}>
                  <div style={{fontWeight:700,marginBottom:"2px"}}>🔀 สถานะควบรวม</div>
                  <div>{sel.note}</div>
                </div>
              )}
            </div>

            {/* KPI navy cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px"}}>
              {[["งบประมาณรวม (total)",fmt(sel.budget.total),"total"],["เบิกจ่าย (withdraw_total)",fmt(sel.budget.withdraw_total),"withdraw_total"],["คงเหลือ (balance)",fmt(sel.budget.balance),"balance"],["คืนเงิน (refund_total)",fmt(sel.budget.refund_total),"refund_total"]].map(([l,v,sub])=>(
                <div key={l} style={s.kpiCard}>
                  <div style={{fontSize:FS.sm,opacity:0.72,lineHeight:1.4}}>{l}</div>
                  <div style={{fontSize:FS["2xl"],fontWeight:700,marginTop:"4px",lineHeight:1.2}}>{v}</div>
                  <div style={{fontSize:FS.xs,opacity:0.55,marginTop:"4px",fontFamily:"monospace"}}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Pillar cards — 6 pillars (P0 Relevance + P1–P5) */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:"10px"}}>
              {PILLARS.map(m=>{
                const psi=scoreInfo(sel.scores[m.key]);
                return <div key={m.key} style={{background:psi.bg,borderRadius:"8px",border:`1px solid ${psi.border}`,padding:"14px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"6px"}}>
                    <span style={{fontSize:"16px"}}>{m.icon}</span>
                    <span style={{fontSize:FS.xs,fontWeight:700,color:m.color,lineHeight:1.3}}>{m.label}</span>
                  </div>
                  <div style={{fontSize:"28px",fontWeight:700,color:psi.color,lineHeight:1}}>{sel.scores[m.key]}</div>
                  <div style={{fontSize:FS.xs,color:T.textSecondary,margin:"5px 0"}}>{m.w} weight</div>
                  <PillarBar score={sel.scores[m.key]}/>
                  <div style={{...s.label,marginTop:"7px"}}>{m.api}</div>
                </div>;
              })}
            </div>

            {/* ── P0: Relevance Overview Panel ── */}
            <div style={{...s.card,borderTop:`3px solid #7c3aed`}}>
              <div style={{...s.cardHead,background:"#faf5ff",borderRadius:"10px 10px 0 0"}}>
                <span style={{background:"#7c3aed",color:"#fff",borderRadius:"6px",padding:"3px 10px",fontWeight:700,fontSize:FS.base}}>P0</span>
                <span style={{fontWeight:700,fontSize:FS.lg,color:"#6d28d9"}}>Relevance — น้ำหนัก 10% (ADB Criterion 1: ความสอดคล้องนโยบาย)</span>
                <span style={{...s.fieldTag,marginLeft:"auto"}}>stvn[] · แผนด้าน ววน. 2566–2570</span>
              </div>
              <div style={{...s.cardBody,display:"grid",gridTemplateColumns:"auto 1fr auto",gap:"20px",alignItems:"start"}}>
                {/* Score + Rating */}
                <div style={{textAlign:"center",background:scoreInfo(sel.scores.p0).bg,borderRadius:"10px",padding:"18px 22px",border:`2px solid ${scoreInfo(sel.scores.p0).border}`,minWidth:"130px"}}>
                  <div style={{fontSize:FS.xs,color:"#6d28d9",fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:"6px"}}>Relevance Score</div>
                  <div style={{fontWeight:900,fontSize:"48px",color:scoreInfo(sel.scores.p0).color,lineHeight:1}}>{sel.scores.p0}</div>
                  <div style={{fontWeight:700,fontSize:FS.sm,color:scoreInfo(sel.scores.p0).color,marginTop:"6px",background:"#fff",borderRadius:"5px",padding:"3px 10px",border:`1px solid ${scoreInfo(sel.scores.p0).border}`}}>{scoreInfo(sel.scores.p0).label}</div>
                  <div style={{marginTop:"10px"}}><PillarBar score={sel.scores.p0}/></div>
                </div>
                {/* Strategy + Plans */}
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px",flexWrap:"wrap"}}>
                    <span style={{fontSize:FS.sm,fontWeight:700,color:T.textSecondary}}>ยุทธศาสตร์ ววน.:</span>
                    {sel.stvn?.strategy.split("+").map(s=>(
                      <span key={s} style={{background:"#7c3aed",color:"#fff",borderRadius:"5px",padding:"4px 12px",fontWeight:700,fontSize:FS.sm}}>{s}</span>
                    ))}
                  </div>
                  <div style={{fontWeight:700,fontSize:FS.sm,color:T.textSecondary,marginBottom:"8px"}}>📋 แผนงานที่รับผิดชอบ ({sel.stvn?.plans?.length||0} แผนงาน)</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"10px"}}>
                    {sel.stvn?.plans?.map((plan,i)=>(
                      <span key={i} style={{background:"#f3f0ff",border:"1px solid #d4c5f5",borderRadius:"5px",padding:"4px 10px",fontSize:FS.sm,color:"#5b21b6",fontWeight:600}}>{plan}</span>
                    ))}
                  </div>
                  <div style={{background:"linear-gradient(135deg,#6d28d9,#4f46e5)",borderRadius:"8px",padding:"12px 16px",color:"#fff",display:"flex",alignItems:"center",gap:"10px"}}>
                    <span style={{fontSize:"20px"}}>🏆</span>
                    <div>
                      <div style={{fontSize:FS.xs,opacity:.75,marginBottom:"2px"}}>Flagship Program</div>
                      <div style={{fontWeight:700,fontSize:FS.base}}>{sel.stvn?.flagship}</div>
                    </div>
                  </div>
                  {sel.mergeGroup&&<div style={{marginTop:"8px",padding:"8px 12px",background:"#ede9fe",borderRadius:"6px",border:"1px solid #c4b5fd",fontSize:FS.sm,color:"#5b21b6"}}>🔀 {sel.note}</div>}
                </div>
                {/* Scoring breakdown bars */}
                <div style={{minWidth:"200px"}}>
                  <div style={{fontWeight:700,fontSize:FS.sm,color:T.textSecondary,marginBottom:"10px"}}>⚖️ Score Breakdown</div>
                  {[
                    ["Strategy Breadth",Math.min(40,(sel.stvn?.strategy.split("+").length||1)*20),40,"#7c3aed",`${sel.stvn?.strategy.split("+").length||1} × 20pt`],
                    ["Plan Count",Math.min(40,(sel.stvn?.plans?.length||0)*8),40,"#6d28d9",`${sel.stvn?.plans?.length||0} × 8pt`],
                    ["Flagship",sel.stvn?.flagship?.length>5?15:5,15,"#5b21b6","15pt max"],
                    ["Merge Bonus",sel.mergeGroup?5:0,5,"#4c1d95",sel.mergeGroup?"+5pt":"0pt"],
                  ].map(([label,score,max,color,sub])=>(
                    <div key={label} style={{marginBottom:"10px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"3px"}}>
                        <span style={{fontSize:FS.xs,color:T.textPrimary,fontWeight:600}}>{label}</span>
                        <span style={{fontSize:FS.xs,fontWeight:700,color}}>{score}/{max} <span style={{color:T.textMuted,fontWeight:400}}>({sub})</span></span>
                      </div>
                      <div style={{background:T.borderLight,borderRadius:"99px",height:"7px"}}>
                        <div style={{width:`${Math.round(score/max*100)}%`,height:"7px",borderRadius:"99px",background:color,transition:"width .5s"}}/>
                      </div>
                    </div>
                  ))}
                  <div style={{marginTop:"8px",padding:"8px 12px",background:"#f3f0ff",borderRadius:"6px",border:"1px solid #d4c5f5",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:FS.sm,fontWeight:700,color:"#6d28d9"}}>Total (cap 100)</span>
                    <span style={{fontWeight:900,fontSize:FS.lg,color:scoreInfo(sel.scores.p0).color}}>{sel.scores.p0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dept info banner */}
            {sel.fullName && <div style={{background:"#f8f9fd",border:`1px solid ${T.borderPrimary}`,borderLeft:`4px solid ${sel.stvn?.color||T.navy}`,borderRadius:"6px",padding:"10px 16px",display:"flex",alignItems:"center",gap:"10px"}}>
              <span style={{fontSize:"16px"}}>🏛️</span>
              <div>
                <div style={{fontWeight:700,fontSize:FS.base,color:T.navy}}>{sel.shortName} — {sel.fullName.split("—")[1]?.trim()||sel.fullName}</div>
                {sel.note&&<div style={{fontSize:FS.xs,color:sel.badgeColor||T.textMuted,marginTop:"2px"}}>📌 {sel.note}</div>}
              </div>
            </div>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
              <div style={s.card}>
                <SectionHead icon="📡" title={`6-Pillar Profile — ${sel.shortName}`}/>
                <div style={s.cardBody}>
                  <ResponsiveContainer width="100%" height={210}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke={T.borderPrimary}/>
                      <PolarAngleAxis dataKey="subject" tick={{fill:T.textSecondary,fontSize:13}}/>
                      <Radar dataKey="value" stroke={T.orange} fill={T.orange} fillOpacity={0.18} dot={{fill:T.orange,r:3}}/>
                      <Tooltip contentStyle={tooltipStyle}/>
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={s.card}>
                <SectionHead icon="📊" title="Final Score เทียบ PMU ทั้งหมด"/>
                <div style={s.cardBody}>
                  <ResponsiveContainer width="100%" height={210}>
                    <BarChart data={barAll} layout="vertical" barSize={16} margin={{top:0,right:24,bottom:0,left:8}}>
                      <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight} horizontal={false}/>
                      <XAxis type="number" domain={[0,100]} tick={{fill:T.textSecondary,fontSize:12}}/>
                      <YAxis type="category" dataKey="name" width={44} tick={{fill:T.textPrimary,fontSize:13,fontWeight:700}}/>
                      <Tooltip contentStyle={tooltipStyle}/>
                      <Bar dataKey="Final" radius={[0,4,4,0]}>
                        {barAll.map((b,i)=><Cell key={i} fill={enriched[i]?.id===selected?T.orange:scoreInfo(b.Final).color}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* ── P1: Budget Execution ── */}
            <div style={{...s.card,borderTop:`3px solid #3b82f6`}}>
              <div style={{...s.cardHead,background:"#eff6ff",borderRadius:"10px 10px 0 0"}}>
                <span style={{background:"#3b82f6",color:"#fff",borderRadius:"6px",padding:"3px 10px",fontWeight:700,fontSize:FS.base}}>P1</span>
                <span style={{fontWeight:700,fontSize:FS.lg,color:"#1d4ed8"}}>Budget Execution — น้ำหนัก 22% (ADB: Efficiency)</span>
                <span style={{...s.fieldTag,marginLeft:"auto"}}>/tsriis-report-withdraw</span>
              </div>
              <div style={{...s.cardBody,display:"grid",gridTemplateColumns:"200px 1fr 1fr",gap:"16px",alignItems:"start"}}>

                {/* LEFT: Donut gauge */}
                {(()=>{
                  const util=sel.budget.withdraw_total/sel.budget.total;
                  const pct95=Math.min(util/0.95,1);
                  const si=scoreInfo(sel.scores.p1);
                  const donutData=[
                    {name:"เบิกจ่ายแล้ว",value:Math.round(util*100)},
                    {name:"คงเหลือ",value:100-Math.round(util*100)},
                  ];
                  const COLORS=[si.color,"#e8ecf4"];
                  return (
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"8px"}}>
                      <div style={{fontSize:FS.sm,fontWeight:700,color:"#1d4ed8",textAlign:"center"}}>Budget Utilization</div>
                      <div style={{position:"relative",width:"160px",height:"160px"}}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={donutData} cx="50%" cy="50%" innerRadius={52} outerRadius={72}
                              startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
                              {donutData.map((_,i)=><Cell key={i} fill={COLORS[i]}/>)}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",pointerEvents:"none"}}>
                          <div style={{fontWeight:700,fontSize:"24px",color:si.color,lineHeight:1}}>{Math.round(util*100)}%</div>
                          <div style={{fontSize:FS.xs,color:T.textMuted,marginTop:"2px"}}>utilization</div>
                        </div>
                      </div>
                      {/* vs เป้าหมาย 95% gauge bar */}
                      <div style={{width:"100%"}}>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:FS.xs,color:T.textMuted,marginBottom:"4px"}}>
                          <span>เทียบเป้า 95%</span>
                          <span style={{fontWeight:700,color:pct95>=1?T.green:T.yellow}}>{pct95>=1?"✓ ผ่าน":"✗ ต่ำกว่าเป้า"}</span>
                        </div>
                        <div style={{background:"#e8ecf4",borderRadius:"99px",height:"10px",position:"relative",overflow:"hidden"}}>
                          <div style={{width:`${Math.min(100,Math.round(util*100))}%`,height:"100%",background:si.color,borderRadius:"99px",transition:"width .5s"}}/>
                          {/* 95% marker */}
                          <div style={{position:"absolute",top:0,left:"95%",width:"2px",height:"100%",background:"#1d4ed8",zIndex:2}}/>
                        </div>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:FS.xs,color:T.textMuted,marginTop:"3px"}}>
                          <span>0%</span><span style={{color:"#1d4ed8",fontWeight:700}}>เป้า 95%</span><span>100%</span>
                        </div>
                      </div>
                      {/* KPI pills */}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px",width:"100%",marginTop:"4px"}}>
                        {[["เบิกแล้ว",fmt(sel.budget.withdraw_total),T.green],["คงเหลือ",fmt(sel.budget.balance),T.red],["คืนเงิน",fmt(sel.budget.refund_total),T.yellow],["Reprogram",fmt(sel.budget.reprogramming),"#8b5cf6"]].map(([k,v,c])=>(
                          <div key={k} style={{background:T.bgSection,borderRadius:"6px",padding:"6px 8px",border:`1px solid ${T.borderLight}`,textAlign:"center"}}>
                            <div style={{fontSize:FS.xs,color:T.textMuted}}>{k}</div>
                            <div style={{fontWeight:700,fontSize:FS.sm,color:c,marginTop:"1px"}}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* MIDDLE: Bar chart แผน vs จริง รายงวด */}
                <div>
                  <div style={{fontSize:FS.sm,fontWeight:700,color:"#1d4ed8",marginBottom:"10px"}}>📅 แผน vs จริง รายงวด (ล้านบาท)</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={withdrawLine} barSize={20} margin={{top:4,right:8,bottom:4,left:0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight}/>
                      <XAxis dataKey="name" tick={{fill:T.textSecondary,fontSize:12}}/>
                      <YAxis tick={{fill:T.textSecondary,fontSize:12}}/>
                      <Tooltip contentStyle={tooltipStyle} formatter={v=>[v.toLocaleString()+" M",""]}/>
                      <Bar dataKey="แผน" fill={T.navy} opacity={0.25} radius={[4,4,0,0]}/>
                      <Bar dataKey="จริง" fill={"#3b82f6"} radius={[4,4,0,0]}/>
                      <Legend wrapperStyle={{fontSize:FS.base}}/>
                    </BarChart>
                  </ResponsiveContainer>
                  {/* Deviation per period */}
                  <div style={{marginTop:"8px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"6px"}}>
                    {sel.budget.withdraw_periods.map((w,i)=>{
                      const dev=w.withdraw-w.budget_plan;
                      const devPct=w.budget_plan>0?Math.round((dev/w.budget_plan)*100):0;
                      return <div key={i} style={{textAlign:"center",background:T.bgSection,borderRadius:"6px",padding:"6px",border:`1px solid ${T.borderLight}`}}>
                        <div style={{fontSize:FS.xs,color:T.textMuted}}>งวด {w.period}</div>
                        <div style={{fontWeight:700,fontSize:FS.sm,color:dev>=0?T.green:T.red,marginTop:"1px"}}>{dev>=0?"+":""}{devPct}%</div>
                      </div>;
                    })}
                  </div>
                </div>

                {/* RIGHT: เปรียบเทียบ utilization ทุก PMU */}
                <div>
                  <div style={{fontSize:FS.sm,fontWeight:700,color:"#1d4ed8",marginBottom:"10px"}}>📊 Utilization เปรียบเทียบทุก PMU</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={enriched.map(p=>({
                        name:p.shortName,
                        utilization:Math.round((p.budget.withdraw_total/p.budget.total)*100),
                        p1score:p.scores.p1,
                        isSel:p.id===selected,
                      }))}
                      layout="vertical" barSize={16} margin={{top:0,right:36,bottom:0,left:8}}>
                      <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight} horizontal={false}/>
                      <XAxis type="number" domain={[0,105]} ticks={[0,25,50,75,95,100]}
                        tick={{fill:T.textSecondary,fontSize:11}}/>
                      <YAxis type="category" dataKey="name" width={42} tick={{fill:T.textPrimary,fontSize:13,fontWeight:700}}/>
                      <Tooltip contentStyle={tooltipStyle}
                        formatter={(v,n,item)=>[v+"%  (P1 Score: "+item.payload.p1score+")", "Utilization"]}/>
                      {/* 95% reference line via custom tick — done via a rect label */}
                      <Bar dataKey="utilization" radius={[0,4,4,0]} label={{position:"right",fontSize:11,fontWeight:700,
                        formatter:v=>v+"%"}}>
                        {enriched.map((p,i)=>(
                          <Cell key={i}
                            fill={p.id===selected?"#3b82f6":scoreInfo(p.scores.p1).color}
                            opacity={p.id===selected?1:0.55}/>
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{display:"flex",alignItems:"center",gap:"6px",marginTop:"6px",fontSize:FS.xs,color:"#1d4ed8"}}>
                    <div style={{width:"16px",height:"2px",background:"#1d4ed8",borderTop:"2px dashed #1d4ed8"}}/>
                    <span>เส้น 95% = เกณฑ์ผ่าน | PMU ที่เลือก = น้ำเงิน</span>
                  </div>
                </div>

              </div>
            </div>

            {/* ── P2/P3/P4/P5 Overview Panels (2x2 grid) ── */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>

              {/* P2 Milestone Progress */}
              <div style={{...s.card,borderTop:`3px solid #f97316`}}>
                <div style={{...s.cardHead,background:"#fff7ed",borderRadius:"10px 10px 0 0"}}>
                  <span style={{background:"#f97316",color:"#fff",borderRadius:"6px",padding:"3px 10px",fontWeight:700,fontSize:FS.base}}>P2</span>
                  <span style={{fontWeight:700,fontSize:FS.lg,color:"#c2410c"}}>Milestone Delivery — น้ำหนัก 28%</span>
                  <span style={{...s.fieldTag,marginLeft:"auto"}}>/milestone</span>
                </div>
                <div style={s.cardBody}>
                  <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:"16px",alignItems:"center"}}>
                    {/* Big score donut */}
                    {(()=>{
                      const avgRate=Math.round(sel.milestones.reduce((a,m)=>a+(m.QuantityOutput>0?m.ActualOutputCount/m.QuantityOutput:1),0)/sel.milestones.length*100);
                      const si2=scoreInfo(sel.scores.p2);
                      const donut2=[{value:avgRate},{value:100-avgRate}];
                      return (
                        <div style={{textAlign:"center"}}>
                          <div style={{position:"relative",width:"110px",height:"110px"}}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={donut2} cx="50%" cy="50%" innerRadius={36} outerRadius={50} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
                                  <Cell fill={si2.color}/><Cell fill="#e8ecf4"/>
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}>
                              <div style={{fontWeight:900,fontSize:"18px",color:si2.color,lineHeight:1}}>{avgRate}%</div>
                              <div style={{fontSize:"10px",color:T.textMuted}}>avg</div>
                            </div>
                          </div>
                          <div style={{fontWeight:700,fontSize:FS.sm,color:si2.color,marginTop:"4px"}}>{si2.short}</div>
                        </div>
                      );
                    })()}
                    {/* Milestone bars */}
                    <div>
                      {sel.milestones.map((m,i)=>{
                        const rate=m.QuantityOutput>0?Math.round(m.ActualOutputCount/m.QuantityOutput*100):100;
                        const msi=scoreInfo(rate);
                        return <div key={i} style={{marginBottom:"10px"}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"3px"}}>
                            <span style={{fontSize:FS.xs,color:T.textPrimary,fontWeight:600,flex:1,marginRight:"8px",lineHeight:1.3}}>{m.DeliveredOutput.length>30?m.DeliveredOutput.slice(0,30)+"...":m.DeliveredOutput}</span>
                            <span style={{fontSize:FS.xs,fontWeight:700,color:msi.color,whiteSpace:"nowrap"}}>{m.ActualOutputCount.toLocaleString()}/{m.QuantityOutput.toLocaleString()} ({rate}%)</span>
                          </div>
                          <div style={{background:T.borderLight,borderRadius:"99px",height:"8px"}}>
                            <div style={{width:`${Math.min(100,rate)}%`,height:"8px",borderRadius:"99px",background:msi.color,transition:"width .5s"}}/>
                          </div>
                        </div>;
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* P3 Contract Health */}
              <div style={{...s.card,borderTop:`3px solid ${T.navy}`}}>
                <div style={{...s.cardHead,background:"#f0f4ff",borderRadius:"10px 10px 0 0"}}>
                  <span style={{background:T.navy,color:"#fff",borderRadius:"6px",padding:"3px 10px",fontWeight:700,fontSize:FS.base}}>P3</span>
                  <span style={{fontWeight:700,fontSize:FS.lg,color:T.navy}}>Contract Health — น้ำหนัก 18%</span>
                  <span style={{...s.fieldTag,marginLeft:"auto"}}>/tsriis-report-withdraw</span>
                </div>
                <div style={s.cardBody}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",alignItems:"start"}}>
                    {/* Gauge bars */}
                    <div>
                      {(()=>{
                        const extMax=5;
                        const extPct=Math.round((sel.budget.contract_extension_count/extMax)*100);
                        const reprPct=Math.round((sel.budget.reprogramming/sel.budget.total)*100);
                        return [
                          ["Contract Extensions",sel.budget.contract_extension_count+" ครั้ง",extPct,sel.budget.contract_extension_count===0?T.green:sel.budget.contract_extension_count<=2?T.yellow:T.red],
                          ["Reprogramming %",reprPct+"%",reprPct,reprPct===0?T.green:reprPct<5?T.yellow:T.red],
                          ["Status",sel.budget.status,sel.budget.status==="ปิดแล้ว"?100:sel.budget.status==="ดำเนินการอยู่"?70:30,sel.budget.status==="ดำเนินการอยู่"?T.yellow:sel.budget.status==="ปิดแล้ว"?T.green:T.red],
                        ].map(([label,val,pct,color])=>(
                          <div key={label} style={{marginBottom:"12px"}}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                              <span style={{fontSize:FS.xs,color:T.textSecondary,fontWeight:600}}>{label}</span>
                              <span style={{fontSize:FS.xs,fontWeight:700,color}}>{val}</span>
                            </div>
                            <div style={{background:T.borderLight,borderRadius:"99px",height:"8px"}}>
                              <div style={{width:`${Math.min(100,pct)}%`,height:"8px",borderRadius:"99px",background:color}}/>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                    {/* Score box */}
                    <div style={{textAlign:"center",background:scoreInfo(sel.scores.p3).bg,borderRadius:"10px",padding:"16px",border:`2px solid ${scoreInfo(sel.scores.p3).border}`}}>
                      <div style={{fontSize:FS.xs,color:scoreInfo(sel.scores.p3).color,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:"6px"}}>P3 Score</div>
                      <div style={{fontWeight:900,fontSize:"40px",color:scoreInfo(sel.scores.p3).color,lineHeight:1}}>{sel.scores.p3}</div>
                      <div style={{fontWeight:700,fontSize:FS.xs,color:scoreInfo(sel.scores.p3).color,marginTop:"6px"}}>{scoreInfo(sel.scores.p3).short}</div>
                      <div style={{marginTop:"12px",fontSize:FS.xs,color:T.textMuted}}>
                        Reprogramming: {fmt(sel.budget.reprogramming)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* P4 Output Quality */}
              <div style={{...s.card,borderTop:`3px solid #16a34a`}}>
                <div style={{...s.cardHead,background:"#f0fdf4",borderRadius:"10px 10px 0 0"}}>
                  <span style={{background:"#16a34a",color:"#fff",borderRadius:"6px",padding:"3px 10px",fontWeight:700,fontSize:FS.base}}>P4</span>
                  <span style={{fontWeight:700,fontSize:FS.lg,color:"#15803d"}}>Output Quality — น้ำหนัก 12%</span>
                  <span style={{...s.fieldTag,marginLeft:"auto"}}>/milestone</span>
                </div>
                <div style={s.cardBody}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:"12px",alignItems:"start"}}>
                    <div>
                      <div style={{fontSize:FS.xs,fontWeight:700,color:T.textSecondary,marginBottom:"8px",textTransform:"uppercase",letterSpacing:".05em"}}>Output Deliverables</div>
                      <ResponsiveContainer width="100%" height={130}>
                        <BarChart data={sel.outputs.map(o=>({name:o.OutputName.length>14?o.OutputName.slice(0,14)+"...":o.OutputName,fullName:o.OutputName,value:o.DeliveryAmount}))} barSize={18} margin={{top:2,right:8,bottom:4,left:0}}>
                          <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight}/>
                          <XAxis dataKey="name" tick={{fill:T.textSecondary,fontSize:10}} angle={-10} textAnchor="end"/>
                          <YAxis tick={{fill:T.textSecondary,fontSize:10}}/>
                          <Tooltip contentStyle={tooltipStyle} labelFormatter={(_,p)=>p?.[0]?.payload?.fullName||""}/>
                          <Bar dataKey="value" name="Delivered" fill="#16a34a" radius={[3,3,0,0]}/>
                        </BarChart>
                      </ResponsiveContainer>
                      <div style={{fontSize:FS.xs,fontWeight:700,color:T.textSecondary,margin:"10px 0 6px",textTransform:"uppercase",letterSpacing:".05em"}}>Target Beneficiaries</div>
                      <div style={{fontWeight:700,fontSize:"20px",color:T.navy}}>{sel.targetBenef[0]?.TargetBenefNum?.toLocaleString()} <span style={{fontSize:FS.sm,fontWeight:400,color:T.textSecondary}}>{sel.targetBenef[0]?.TargetBenefUnitCount}</span></div>
                    </div>
                    <div style={{textAlign:"center",background:scoreInfo(sel.scores.p4).bg,borderRadius:"10px",padding:"16px",border:`2px solid ${scoreInfo(sel.scores.p4).border}`,minWidth:"90px"}}>
                      <div style={{fontSize:FS.xs,color:"#15803d",fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:"6px"}}>P4 Score</div>
                      <div style={{fontWeight:900,fontSize:"40px",color:scoreInfo(sel.scores.p4).color,lineHeight:1}}>{sel.scores.p4}</div>
                      <div style={{fontWeight:700,fontSize:FS.xs,color:scoreInfo(sel.scores.p4).color,marginTop:"6px"}}>{scoreInfo(sel.scores.p4).short}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* P5 Leverage */}
              <div style={{...s.card,borderTop:`3px solid #8b5cf6`}}>
                <div style={{...s.cardHead,background:"#f5f0ff",borderRadius:"10px 10px 0 0"}}>
                  <span style={{background:"#8b5cf6",color:"#fff",borderRadius:"6px",padding:"3px 10px",fontWeight:700,fontSize:FS.base}}>P5</span>
                  <span style={{fontWeight:700,fontSize:FS.lg,color:"#6d28d9"}}>Leverage — น้ำหนัก 10%</span>
                  <span style={{...s.fieldTag,marginLeft:"auto"}}>/in-cash-inkind</span>
                </div>
                <div style={s.cardBody}>
                  <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:"12px",alignItems:"center"}}>
                    {/* Leverage donut */}
                    {(()=>{
                      const leverPct=Math.round(sel.leverage.InCash/sel.leverage.BudgetGrant*100);
                      const si5=scoreInfo(sel.scores.p5);
                      const leverData=[{value:leverPct},{value:Math.max(0,100-leverPct)}];
                      return (
                        <div style={{textAlign:"center"}}>
                          <div style={{position:"relative",width:"110px",height:"110px"}}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={leverData} cx="50%" cy="50%" innerRadius={36} outerRadius={50} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
                                  <Cell fill={si5.color}/><Cell fill="#e8ecf4"/>
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}>
                              <div style={{fontWeight:900,fontSize:"16px",color:si5.color,lineHeight:1}}>{leverPct}%</div>
                              <div style={{fontSize:"9px",color:T.textMuted}}>co-fin</div>
                            </div>
                          </div>
                          <div style={{fontWeight:700,fontSize:FS.sm,color:si5.color,marginTop:"4px"}}>{si5.short}</div>
                        </div>
                      );
                    })()}
                    <div>
                      <div style={{fontSize:FS.xs,fontWeight:700,color:T.textSecondary,marginBottom:"8px"}}>Co-financing Partners</div>
                      {sel.leverage.partners.map((p,i)=>(
                        <div key={i} style={{background:"#f5f0ff",borderRadius:"6px",padding:"8px 10px",marginBottom:"6px",border:"1px solid #d4c5f5"}}>
                          <div style={{fontWeight:700,fontSize:FS.sm,color:"#6d28d9"}}>{p.OrgName}</div>
                          <div style={{fontSize:FS.xs,color:T.textSecondary,marginTop:"2px"}}>InCash: {fmt(p.InCash)}</div>
                        </div>
                      ))}
                      <div style={{marginTop:"8px",fontSize:FS.xs,color:T.textMuted,fontStyle:"italic"}}>{sel.leverage.InKind}</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>{/* end P2/P3/P4/P5 grid */}
          </div>}

          {tab==="detail" && <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>

            {/* ── P0: Relevance ── */}
            <div style={{...s.card,borderTop:`3px solid #7c3aed`}}>
              <div style={{...s.cardHead,background:"#faf5ff",borderRadius:"10px 10px 0 0"}}>
                <span style={{background:"#7c3aed",color:"#fff",borderRadius:"6px",padding:"3px 10px",fontWeight:700,fontSize:FS.base}}>P0</span>
                <span style={{fontWeight:700,fontSize:FS.lg,color:"#6d28d9"}}>Relevance — น้ำหนัก 10% (ADB Criterion 1)</span>
                <span style={{...s.fieldTag,marginLeft:"auto"}}>stvn[] · แผนด้าน ววน. 2566–2570</span>
              </div>
              <div style={{...s.cardBody,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"16px",alignItems:"start"}}>

                {/* Score card */}
                <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                  <div style={{textAlign:"center",background:scoreInfo(sel.scores.p0).bg,borderRadius:"10px",padding:"20px",border:`2px solid ${scoreInfo(sel.scores.p0).border}`}}>
                    <div style={{fontSize:FS.xs,color:"#6d28d9",fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:"6px"}}>Relevance Score</div>
                    <div style={{fontWeight:900,fontSize:"44px",color:scoreInfo(sel.scores.p0).color,lineHeight:1}}>{sel.scores.p0}</div>
                    <div style={{fontWeight:700,fontSize:FS.sm,color:scoreInfo(sel.scores.p0).color,marginTop:"6px"}}>{scoreInfo(sel.scores.p0).label}</div>
                    <div style={{marginTop:"10px"}}><PillarBar score={sel.scores.p0}/></div>
                  </div>
                  <div style={{background:T.bgSection,borderRadius:"8px",padding:"12px",border:`1px solid ${T.borderLight}`}}>
                    <div style={{fontSize:FS.xs,fontWeight:700,color:"#6d28d9",marginBottom:"6px"}}>ADB Definition</div>
                    <div style={{fontSize:FS.sm,color:T.textPrimary,lineHeight:1.6}}>
                      ความสอดคล้องของวัตถุประสงค์โครงการกับ (i) ความต้องการของประเทศ (ii) นโยบายรัฐบาล (iii) ยุทธศาสตร์ ววน. และ (iv) ลำดับความสำคัญของ สกสว.
                    </div>
                  </div>
                </div>

                {/* Strategy alignment */}
                <div>
                  <div style={{fontWeight:700,fontSize:FS.base,color:"#6d28d9",marginBottom:"10px"}}>🗺 ยุทธศาสตร์ ววน. ที่รับผิดชอบ</div>
                  <div style={{display:"flex",gap:"8px",marginBottom:"12px",flexWrap:"wrap"}}>
                    {sel.stvn?.strategy.split("+").map(s=>(
                      <span key={s} style={{background:"#7c3aed",color:"#fff",borderRadius:"6px",padding:"6px 14px",fontWeight:700,fontSize:FS.base}}>{s}</span>
                    ))}
                  </div>
                  <div style={{fontWeight:700,fontSize:FS.sm,color:"#6d28d9",marginBottom:"8px"}}>📋 แผนงานที่รับผิดชอบ ({sel.stvn?.plans?.length||0} แผนงาน)</div>
                  {sel.stvn?.plans?.map((plan,i)=>(
                    <div key={i} style={{padding:"8px 12px",background:"#f3f0ff",borderRadius:"6px",border:"1px solid #d4c5f5",marginBottom:"6px",fontSize:FS.sm,color:"#5b21b6",fontWeight:600}}>{plan}</div>
                  ))}
                  {sel.mergeGroup && (
                    <div style={{marginTop:"10px",padding:"10px 12px",background:"#ede9fe",borderRadius:"6px",border:"1px solid #c4b5fd"}}>
                      <div style={{fontWeight:700,fontSize:FS.sm,color:"#7c3aed",marginBottom:"3px"}}>🔀 สถานะควบรวม</div>
                      <div style={{fontSize:FS.sm,color:"#5b21b6",lineHeight:1.5}}>{sel.note}</div>
                    </div>
                  )}
                </div>

                {/* Flagship + Scoring breakdown */}
                <div>
                  <div style={{fontWeight:700,fontSize:FS.base,color:"#6d28d9",marginBottom:"10px"}}>🏆 Flagship Program</div>
                  <div style={{background:"linear-gradient(135deg,#6d28d9,#4f46e5)",borderRadius:"8px",padding:"14px",color:"#fff",marginBottom:"12px"}}>
                    <div style={{fontSize:FS.xs,opacity:.75,marginBottom:"4px"}}>Flagship / แผนงานสำคัญ</div>
                    <div style={{fontWeight:700,fontSize:FS.base,lineHeight:1.4}}>{sel.stvn?.flagship}</div>
                  </div>
                  <div style={{fontWeight:700,fontSize:FS.sm,color:T.textSecondary,marginBottom:"8px"}}>⚖️ Relevance Score Breakdown</div>
                  {[
                    ["Strategy Breadth",`${sel.stvn?.strategy.split("+").length||1} ยุทธศาสตร์ × 20`,Math.min(40,(sel.stvn?.strategy.split("+").length||1)*20),"#7c3aed"],
                    ["Plan Count",`${sel.stvn?.plans?.length||0} แผนงาน × 8`,Math.min(40,(sel.stvn?.plans?.length||0)*8),"#6d28d9"],
                    ["Flagship",sel.stvn?.flagship?"มี Flagship ชัดเจน":"ไม่มี Flagship",sel.stvn?.flagship?.length>5?15:5,"#5b21b6"],
                    ["Merge Bonus",sel.mergeGroup?"Cross-cutting scope +5":"ไม่ใช่หน่วยควบรวม",sel.mergeGroup?5:0,"#4c1d95"],
                  ].map(([label,desc,pts,color])=>(
                    <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${T.borderLight}`}}>
                      <div>
                        <div style={{fontSize:FS.sm,fontWeight:600,color:T.textPrimary}}>{label}</div>
                        <div style={{fontSize:FS.xs,color:T.textMuted}}>{desc}</div>
                      </div>
                      <span style={{fontWeight:700,fontSize:FS.base,color,minWidth:"32px",textAlign:"right"}}>+{pts}</span>
                    </div>
                  ))}
                  <div style={{marginTop:"8px",display:"flex",justifyContent:"space-between",padding:"8px 12px",background:"#f3f0ff",borderRadius:"6px",border:"1px solid #d4c5f5"}}>
                    <span style={{fontWeight:700,fontSize:FS.base,color:"#6d28d9"}}>Total (capped 100)</span>
                    <span style={{fontWeight:900,fontSize:FS.lg,color:"#6d28d9"}}>{sel.scores.p0}</span>
                  </div>
                </div>

              </div>
            </div>

            <div style={s.card}>
              <SectionHead icon="🎯" title="P2: Milestone Delivery (ADB Criterion 2 — Effectiveness)" api="/milestone → QuantityOutput / ActualOutputCount"/>
              <div style={s.cardBody}>
                <table style={{width:"100%",borderCollapse:"collapse",marginBottom:"14px"}}>
                  <thead><tr>{["Milestone","Target","Actual","Completion %","Type"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {msData.map((m,i)=>{
                      const msi=scoreInfo(m.rate);
                      return <tr key={i} style={{background:i%2===0?T.bgDefault:T.bgSection}}>
                        <td style={{...s.td,fontWeight:600}}>{m.fullName}</td>
                        <td style={{...s.td,textAlign:"center",color:T.textSecondary}}>{m.target.toLocaleString()}</td>
                        <td style={{...s.td,textAlign:"center",fontWeight:700,color:T.navy}}>{m.actual.toLocaleString()}</td>
                        <td style={s.td}><div style={{display:"flex",alignItems:"center",gap:"8px"}}><div style={{...s.barTrack,width:"70px"}}><div style={{width:`${Math.min(100,m.rate)}%`,height:"7px",borderRadius:"99px",background:msi.color}}/></div><span style={{fontWeight:700,color:msi.color,fontSize:FS.base}}>{m.rate}%</span></div></td>
                        <td style={{...s.td,color:T.textMuted,fontSize:FS.sm}}>{m.KRType}</td>
                      </tr>;
                    })}
                  </tbody>
                </table>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={msData} barSize={20} margin={{top:0,right:10,bottom:30,left:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight}/>
                    <XAxis dataKey="name" tick={{fill:T.textSecondary,fontSize:12}} angle={-20} textAnchor="end"/>
                    <YAxis tick={{fill:T.textSecondary,fontSize:12}}/>
                    <Tooltip contentStyle={tooltipStyle} labelFormatter={(_,p)=>p?.[0]?.payload?.fullName||""}/>
                    <Bar dataKey="target" name="Target" fill={T.borderPrimary} radius={[3,3,0,0]}/>
                    <Bar dataKey="actual" name="Actual" fill={T.orange} radius={[3,3,0,0]}/>
                    <Legend wrapperStyle={{fontSize:FS.sm}}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"12px"}}>
              {/* P1 Summary (Quick ref — Detail ของ P1 อยู่ใน Tab ภาพรวม) */}
              <div style={s.card}>
                <SectionHead icon="💰" title="P1: Budget Execution (ADB C3)" api="/tsriis-report-withdraw"/>
                <div style={s.cardBody}>
                  {(()=>{
                    const util=sel.budget.withdraw_total/sel.budget.total;
                    const si1=scoreInfo(sel.scores.p1);
                    const donut1=[{value:Math.round(util*100)},{value:100-Math.round(util*100)}];
                    return (
                      <div style={{display:"flex",gap:"14px",alignItems:"center"}}>
                        <div style={{position:"relative",width:"90px",height:"90px",flexShrink:0}}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={donut1} cx="50%" cy="50%" innerRadius={28} outerRadius={42} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
                                <Cell fill={si1.color}/><Cell fill="#e8ecf4"/>
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}>
                            <div style={{fontWeight:900,fontSize:"15px",color:si1.color,lineHeight:1}}>{Math.round(util*100)}%</div>
                          </div>
                        </div>
                        <div style={{flex:1}}>
                          {[["Total",fmt(sel.budget.total),T.textSecondary],["Withdrawn",fmt(sel.budget.withdraw_total),si1.color],["Balance",fmt(sel.budget.balance),T.red],["Reprogram",fmt(sel.budget.reprogramming),T.yellow]].map(([k,v,c])=>(
                            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${T.borderLight}`}}>
                              <span style={{fontSize:FS.xs,color:T.textMuted}}>{k}</span>
                              <span style={{fontWeight:700,fontSize:FS.xs,color:c}}>{v}</span>
                            </div>
                          ))}
                          <div style={{marginTop:"8px",textAlign:"center",background:si1.bg,borderRadius:"6px",padding:"6px",border:`1px solid ${si1.border}`}}>
                            <span style={{fontWeight:700,fontSize:FS.sm,color:si1.color}}>Score: {sel.scores.p1} · {si1.short}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  <div style={{marginTop:"12px"}}>
                    <div style={{fontSize:FS.xs,fontWeight:700,color:T.textSecondary,marginBottom:"6px"}}>รายงวดการเบิกจ่าย</div>
                    <ResponsiveContainer width="100%" height={80}>
                      <BarChart data={sel.budget.withdraw_periods.map(w=>({name:`งวด${w.period}`,แผน:Math.round(w.budget_plan/1e6),จริง:Math.round(w.withdraw/1e6)}))} barSize={10} margin={{top:2,right:4,bottom:0,left:-20}}>
                        <XAxis dataKey="name" tick={{fill:T.textSecondary,fontSize:10}}/>
                        <YAxis tick={{fill:T.textSecondary,fontSize:9}}/>
                        <Tooltip contentStyle={tooltipStyle} formatter={v=>[v+"M",""]}/>
                        <Bar dataKey="แผน" fill={T.navy} opacity={0.3} radius={[2,2,0,0]}/>
                        <Bar dataKey="จริง" fill={"#3b82f6"} radius={[2,2,0,0]}/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* P3 Contract — with comparison chart */}
              <div style={s.card}>
                <SectionHead icon="📋" title="P3: Contract Health (ADB C4a)" api="/tsriis-report-withdraw"/>
                <div style={s.cardBody}>
                  {[["status",sel.budget.status,sel.budget.status==="ปิดแล้ว"?T.green:sel.budget.status==="ดำเนินการอยู่"?T.yellow:T.red],["contract_extension_count",sel.budget.contract_extension_count+" ครั้ง",sel.budget.contract_extension_count===0?T.green:sel.budget.contract_extension_count<=2?T.yellow:T.red],["extension_status",sel.budget.contract_extension_status,T.textSecondary],["reprogramming",fmt(sel.budget.reprogramming),sel.budget.reprogramming===0?T.green:T.yellow]].map(([k,v,c])=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${T.borderLight}`}}>
                      <span style={s.label}>{k}</span>
                      <span style={{fontWeight:700,fontSize:FS.base,color:c}}>{v}</span>
                    </div>
                  ))}
                  <div style={{marginTop:"10px",background:scoreInfo(sel.scores.p3).bg,borderRadius:"8px",padding:"8px 12px",border:`1px solid ${scoreInfo(sel.scores.p3).border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontWeight:700,fontSize:FS.sm,color:scoreInfo(sel.scores.p3).color}}>P3 Score</span>
                    <span style={{fontWeight:900,fontSize:"24px",color:scoreInfo(sel.scores.p3).color}}>{sel.scores.p3} <span style={{fontSize:FS.xs}}>{scoreInfo(sel.scores.p3).short}</span></span>
                  </div>
                  {/* Comparison chart: P3 all PMUs */}
                  <div style={{fontSize:FS.xs,fontWeight:700,color:T.textSecondary,margin:"12px 0 6px"}}>เปรียบเทียบ P3 ทุก PMU</div>
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={enriched.map(p=>({name:p.shortName,score:p.scores.p3,ext:p.budget.contract_extension_count}))} layout="vertical" barSize={10} margin={{top:0,right:28,bottom:0,left:8}}>
                      <XAxis type="number" domain={[0,100]} tick={{fill:T.textSecondary,fontSize:10}}/>
                      <YAxis type="category" dataKey="name" width={36} tick={{fill:T.textPrimary,fontSize:11,fontWeight:700}}/>
                      <Tooltip contentStyle={tooltipStyle} formatter={(v,_,item)=>[v+" (ext:"+item.payload.ext+"ครั้ง)","P3"]}/>
                      <Bar dataKey="score" radius={[0,3,3,0]}>
                        {enriched.map((p,i)=><Cell key={i} fill={p.id===selected?T.navy:scoreInfo(p.scores.p3).color} opacity={p.id===selected?1:0.6}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* P5 Leverage — with comparison chart */}
              <div style={s.card}>
                <SectionHead icon="🤝" title="P5: Leverage (ADB C4b)" api="/in-cash-inkind"/>
                <div style={s.cardBody}>
                  {[["BudgetGrant",fmt(sel.leverage.BudgetGrant),T.textSecondary],["InCash",fmt(sel.leverage.InCash),"#8b5cf6"],["Leverage Ratio",pct(sel.leverage.InCash/sel.leverage.BudgetGrant),"#8b5cf6"]].map(([k,v,c])=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${T.borderLight}`}}>
                      <span style={s.label}>{k}</span>
                      <span style={{fontWeight:700,fontSize:FS.base,color:c}}>{v}</span>
                    </div>
                  ))}
                  <div style={{marginTop:"10px",background:"#f5f0ff",borderRadius:"8px",padding:"8px 12px",border:"1px solid #d4c5f5",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontWeight:700,fontSize:FS.sm,color:"#6d28d9"}}>P5 Score</span>
                    <span style={{fontWeight:900,fontSize:"24px",color:scoreInfo(sel.scores.p5).color}}>{sel.scores.p5} <span style={{fontSize:FS.xs}}>{scoreInfo(sel.scores.p5).short}</span></span>
                  </div>
                  <div style={{marginTop:"8px",fontSize:FS.xs,color:T.textSecondary,fontStyle:"italic",padding:"7px",background:T.bgSection,borderRadius:"5px"}}>{sel.leverage.InKind}</div>
                  {/* Leverage ratio comparison chart */}
                  <div style={{fontSize:FS.xs,fontWeight:700,color:T.textSecondary,margin:"10px 0 6px"}}>Leverage Ratio เปรียบเทียบ (%) — เกณฑ์ ADB ≥20%</div>
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={enriched.map(p=>({name:p.shortName,ratio:Math.round(p.leverage.InCash/p.leverage.BudgetGrant*100)}))} layout="vertical" barSize={10} margin={{top:0,right:28,bottom:0,left:8}}>
                      <XAxis type="number" domain={[0,80]} tick={{fill:T.textSecondary,fontSize:10}}/>
                      <YAxis type="category" dataKey="name" width={36} tick={{fill:T.textPrimary,fontSize:11,fontWeight:700}}/>
                      <Tooltip contentStyle={tooltipStyle} formatter={v=>[v+"%","Ratio"]}/>
                      <Bar dataKey="ratio" radius={[0,3,3,0]}>
                        {enriched.map((p,i)=><Cell key={i} fill={p.id===selected?"#8b5cf6":scoreInfo(p.scores.p5).color} opacity={p.id===selected?1:0.6}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* P4 Output/Outcome full section */}
            <div style={{...s.card,borderTop:`3px solid #16a34a`}}>
              <div style={{...s.cardHead,background:"#f0fdf4",borderRadius:"10px 10px 0 0"}}>
                <span style={{background:"#16a34a",color:"#fff",borderRadius:"6px",padding:"3px 10px",fontWeight:700,fontSize:FS.base}}>P4</span>
                <span style={{fontWeight:700,fontSize:FS.lg,color:"#15803d"}}>Output Quality / Outcome (ADB Criterion 2b)</span>
                <span style={{...s.fieldTag,marginLeft:"auto"}}>/milestone → output[] + outcome[] + targetBenef[]</span>
              </div>
              <div style={{...s.cardBody,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"16px"}}>
                {/* Output list */}
                <div>
                  <div style={{fontSize:FS.xs,fontWeight:700,color:T.textSecondary,marginBottom:"8px",textTransform:"uppercase",letterSpacing:".05em"}}>output[]</div>
                  {sel.outputs.map((o,i)=>(
                    <div key={i} style={{padding:"9px 0",borderBottom:`1px solid ${T.borderLight}`,display:"flex",justifyContent:"space-between",gap:"8px"}}>
                      <span style={{fontSize:FS.base,color:T.textPrimary,flex:1}}>{o.OutputName}</span>
                      <span style={{fontWeight:700,color:T.orange,fontSize:FS.base,whiteSpace:"nowrap"}}>{o.DeliveryAmount.toLocaleString()} {o.UnitCount}</span>
                    </div>
                  ))}
                  <div style={{marginTop:"10px",fontSize:FS.xs,fontWeight:700,color:T.textSecondary,marginBottom:"8px",textTransform:"uppercase",letterSpacing:".05em"}}>outcome[]</div>
                  {sel.outcomes.map((o,i)=>(
                    <div key={i} style={{padding:"9px 0",borderBottom:`1px solid ${T.borderLight}`,display:"flex",justifyContent:"space-between",gap:"8px"}}>
                      <span style={{fontSize:FS.base,color:T.textPrimary,flex:1}}>{o.OutcomeName}</span>
                      <span style={{fontWeight:700,color:T.navy,fontSize:FS.base,whiteSpace:"nowrap"}}>{o.OutcomeAmount?.toLocaleString()||"—"} {o.UnitCount}</span>
                    </div>
                  ))}
                  <div style={{background:T.bgSection,borderRadius:"8px",padding:"12px",marginTop:"12px",border:`1px solid ${T.borderLight}`}}>
                    <div style={s.label}>targetBenef[].TargetBenefNum</div>
                    <div style={{fontWeight:700,fontSize:"22px",color:T.navy,marginTop:"4px"}}>{sel.targetBenef[0]?.TargetBenefNum?.toLocaleString()} <span style={{fontSize:FS.base,fontWeight:400,color:T.textSecondary}}>{sel.targetBenef[0]?.TargetBenefUnitCount}</span></div>
                  </div>
                </div>
                {/* Output bar chart */}
                <div>
                  <div style={{fontSize:FS.xs,fontWeight:700,color:T.textSecondary,marginBottom:"8px"}}>Output Delivered (chart)</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={sel.outputs.map(o=>({name:o.OutputName.length>16?o.OutputName.slice(0,16)+"…":o.OutputName,fullName:o.OutputName,value:o.DeliveryAmount}))} barSize={28} margin={{top:4,right:8,bottom:40,left:0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight}/>
                      <XAxis dataKey="name" tick={{fill:T.textSecondary,fontSize:11}} angle={-20} textAnchor="end"/>
                      <YAxis tick={{fill:T.textSecondary,fontSize:11}}/>
                      <Tooltip contentStyle={tooltipStyle} labelFormatter={(_,p)=>p?.[0]?.payload?.fullName||""}/>
                      <Bar dataKey="value" name="Delivered" fill="#16a34a" radius={[4,4,0,0]}>
                        {sel.outputs.map((_,i)=><Cell key={i} fill={i%2===0?"#16a34a":"#22c55e"}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* P4 comparison all PMU */}
                <div>
                  <div style={{fontSize:FS.xs,fontWeight:700,color:T.textSecondary,marginBottom:"8px"}}>P4 Score เปรียบเทียบทุก PMU</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={enriched.map(p=>({name:p.shortName,score:p.scores.p4}))} layout="vertical" barSize={12} margin={{top:0,right:28,bottom:0,left:8}}>
                      <XAxis type="number" domain={[0,100]} tick={{fill:T.textSecondary,fontSize:10}}/>
                      <YAxis type="category" dataKey="name" width={40} tick={{fill:T.textPrimary,fontSize:12,fontWeight:700}}/>
                      <Tooltip contentStyle={tooltipStyle}/>
                      <Bar dataKey="score" radius={[0,4,4,0]}>
                        {enriched.map((p,i)=><Cell key={i} fill={p.id===selected?"#16a34a":scoreInfo(p.scores.p4).color} opacity={p.id===selected?1:0.6}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </div>}

          {/* ═══ PPER REPORT ═══ */}
          {tab==="pper" && (()=>{
            const sc = sel.scores;
            const overallSi = scoreInfo(sc.final);
            const relSi  = criterionRating(sc.relevance);
            const effvSi = criterionRating(sc.effectiveness);
            const effiSi = criterionRating(sc.efficiency);
            const sustSi = criterionRating(sc.sustainability);

            // ADB criterion weights for overall composite
            const criteriaRows=[
              {id:"C1",label:"Relevance",         labelTh:"ความสอดคล้อง (Relevance)",    score:sc.relevance,   si:relSi,  weight:0.20,
               adbDef:"ความสอดคล้องของวัตถุประสงค์โครงการกับนโยบาย ววน. ยุทธศาสตร์ชาติ และความต้องการของผู้รับประโยชน์",
               source:"stvn.strategy + plans[]",
               finding: sc.relevance>=85
                 ? `${sel.shortName} มีความสอดคล้องสูงมากกับแผนด้าน ววน. ครอบคลุมยุทธศาสตร์ ${sel.stvn?.strategy} และดำเนินการภายใต้ ${sel.stvn?.plans?.length||0} แผนงาน Flagship: ${sel.stvn?.flagship}`
                 : sc.relevance>=65
                 ? `${sel.shortName} สอดคล้องกับแผนด้าน ววน. ยุทธศาสตร์ ${sel.stvn?.strategy} ครอบคลุม ${sel.stvn?.plans?.length||0} แผนงาน`
                 : `${sel.shortName} มีความสอดคล้องบางส่วนกับแผนด้าน ววน. ยุทธศาสตร์ ${sel.stvn?.strategy} — ควรขยาย scope แผนงาน`
              },
              {id:"C2",label:"Effectiveness",     labelTh:"ประสิทธิผล (Effectiveness)",  score:sc.effectiveness,si:effvSi, weight:0.30,
               adbDef:"ระดับที่โครงการบรรลุ Outcome และ Output ตามที่ระบุใน DMF (Design and Monitoring Framework)",
               source:"/milestone → ActualOutputCount/QuantityOutput + targetBenef[]",
               finding: (()=>{
                 const avgMs=Math.round(sel.milestones.reduce((a,m)=>a+(m.QuantityOutput>0?m.ActualOutputCount/m.QuantityOutput:1),0)/sel.milestones.length*100);
                 const bestMs=sel.milestones.reduce((a,m)=>a.ActualOutputCount/a.QuantityOutput>m.ActualOutputCount/m.QuantityOutput?a:m);
                 const worstMs=sel.milestones.reduce((a,m)=>a.ActualOutputCount/a.QuantityOutput<m.ActualOutputCount/m.QuantityOutput?a:m);
                 return `Milestone completion เฉลี่ย ${avgMs}% — ผลสัมฤทธิ์สูงสุด: "${bestMs.DeliveredOutput}" (${Math.round(bestMs.ActualOutputCount/bestMs.QuantityOutput*100)}%) — ต้องเร่งรัด: "${worstMs.DeliveredOutput}" (${Math.round(worstMs.ActualOutputCount/worstMs.QuantityOutput*100)}%)`;
               })()
              },
              {id:"C3",label:"Efficiency",        labelTh:"ประสิทธิภาพ (Efficiency)",    score:sc.efficiency,  si:effiSi, weight:0.25,
               adbDef:"ความสำเร็จของโครงการในแง่ต้นทุน เวลา และการเบิกจ่ายงบประมาณเทียบกับแผนที่กำหนด",
               source:"/tsriis-report-withdraw → withdraw_total/total + reprogramming",
               finding: (()=>{
                 const util=sel.budget.withdraw_total/sel.budget.total;
                 const reprPct=(sel.budget.reprogramming/sel.budget.total*100).toFixed(1);
                 const extC=sel.budget.contract_extension_count;
                 return `Utilization rate ${(util*100).toFixed(1)}% ${util>=0.95?"— บรรลุเกณฑ์ ADB 95%":"— ต่ำกว่าเกณฑ์ 95%"}, Reprogramming ${reprPct}% ของงบทั้งหมด${extC>0?`, ขยายสัญญา ${extC} ครั้งส่งผลต่อ Cost-efficiency`:""}`;
               })()
              },
              {id:"C4",label:"Sustainability",    labelTh:"ความยั่งยืน (Sustainability)", score:sc.sustainability,si:sustSi,weight:0.25,
               adbDef:"ความน่าจะเป็นที่ผลลัพธ์ของโครงการจะคงอยู่และยั่งยืน รวมถึงการระดมทุนร่วมจากภาคเอกชน",
               source:"/tsriis-report-withdraw → contract status + /in-cash-inkind → InCash",
               finding: (()=>{
                 const leverRatio=(sel.leverage.InCash/sel.leverage.BudgetGrant*100).toFixed(1);
                 return `Co-financing ratio ${leverRatio}% ${leverRatio>=20?"(ดี — เกินเกณฑ์ 20%)":"(ต่ำกว่าเกณฑ์ 20%)"}; สถานะสัญญา: ${sel.budget.status}; InKind: ${sel.leverage.InKind}`;
               })()
              },
            ];

            // Overall ADB composite from 4 criteria
            const adbFinal = Math.round(criteriaRows.reduce((a,c)=>a+c.score*c.weight,0));
            const adbSi = scoreInfo(adbFinal);

            // Key Findings generator
            const strengths=[];
            const weaknesses=[];
            criteriaRows.forEach(c=>{
              if(c.score>=75) strengths.push({label:c.label,score:c.score,finding:c.finding});
              else weaknesses.push({label:c.label,score:c.score,finding:c.finding});
            });
            if(sel.mergeGroup) strengths.push({label:"การบูรณาการ",score:null,finding:`${sel.shortName} อยู่ระหว่างควบรวมตามมติ ครม. พ.ย. 2568 — เพิ่มประสิทธิภาพการบริหารจัดการ`});

            // Recommendations
            const recs=[];
            if(sc.efficiency<75) recs.push({no:"R1",area:"Efficiency",text:`เร่งรัดการเบิกจ่ายให้ถึง 95% target โดยจัดทำ disbursement plan รายไตรมาสและติดตามรายเดือน`});
            if(sc.effectiveness<75) recs.push({no:"R2",area:"Effectiveness",text:`ทบทวน milestone ที่ completion < 80% และปรับ action plan พร้อม assign accountability ชัดเจน`});
            if(sc.sustainability<75) recs.push({no:"R3",area:"Sustainability",text:`เพิ่ม co-financing engagement กับภาคเอกชน เป้าหมาย leverage ratio ≥ 20% ของงบประมาณ`});
            if(sc.relevance<75) recs.push({no:"R4",area:"Relevance",text:`ขยาย scope เชื่อม Flagship ให้ครอบคลุมยุทธศาสตร์ ววน. มากขึ้น เพื่อเพิ่มความสอดคล้องเชิงนโยบาย`});
            if(sel.budget.contract_extension_count>2) recs.push({no:"R5",area:"Contract Mgmt",text:`วางระบบ contract management ที่เข้มแข็ง — extension ${sel.budget.contract_extension_count} ครั้ง เกินเกณฑ์ ADB ที่ยอมรับได้ (≤2 ครั้ง)`});
            if(recs.length===0) recs.push({no:"R1",area:"Continuous Improvement",text:`รักษาระดับ performance ที่ดีและถ่ายทอดบทเรียนไปยัง PMU อื่นผ่าน peer learning mechanism`});

            return (
            <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>

              {/* ── PPER Header ── */}
              <div style={{background:`linear-gradient(135deg,${T.navy} 0%,#1e40af 100%)`,borderRadius:"12px",padding:"20px 24px",color:"#fff"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"12px"}}>
                  <div>
                    <div style={{fontSize:FS.xs,fontWeight:700,letterSpacing:".12em",opacity:.7,textTransform:"uppercase",marginBottom:"6px"}}>
                      Project Performance Evaluation Report (PPER)
                    </div>
                    <div style={{fontWeight:900,fontSize:FS["2xl"],lineHeight:1.2,marginBottom:"6px"}}>{sel.shortName}</div>
                    <div style={{fontSize:FS.base,opacity:.85,lineHeight:1.5,maxWidth:"540px"}}>{sel.fullName}</div>
                    <div style={{marginTop:"10px",fontSize:FS.sm,opacity:.7}}>
                      อ้างอิง: ADB Guidelines for the Evaluation of Public Sector Operations (IED, 2016) ·
                      แผนด้าน ววน. พ.ศ. 2566–2570 (ฉบับปรับปรุง ปีงบ 2569–2570)
                    </div>
                  </div>
                  <div style={{textAlign:"center",background:"rgba(255,255,255,.12)",borderRadius:"12px",padding:"16px 24px",border:"1px solid rgba(255,255,255,.25)"}}>
                    <div style={{fontSize:FS.xs,opacity:.7,marginBottom:"4px",textTransform:"uppercase",letterSpacing:".1em"}}>Overall Rating</div>
                    <div style={{fontWeight:900,fontSize:"44px",lineHeight:1,color:adbSi.color,background:"#fff",borderRadius:"8px",padding:"4px 16px",marginBottom:"6px"}}>{adbFinal}</div>
                    <div style={{fontWeight:700,fontSize:FS.sm,background:adbSi.bg,color:adbSi.color,border:`1px solid ${adbSi.border}`,borderRadius:"6px",padding:"4px 14px"}}>{adbSi.label}</div>
                  </div>
                </div>
                {/* Quick stats bar */}
                <div style={{marginTop:"16px",display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"10px"}}>
                  {[["งบประมาณ",fmtM(sel.budget.total),"💰"],["เบิกจ่าย",fmtM(sel.budget.withdraw_total),"📤"],
                    ["ผู้รับประโยชน์",`${(sel.targetBenef[0]?.TargetBenefNum||0).toLocaleString()} ${sel.targetBenef[0]?.TargetBenefUnitCount}`,"👥"],
                    ["Co-financing",fmtM(sel.leverage.InCash),"🤝"],
                    ["ยุทธศาสตร์ ววน.",sel.stvn?.strategy,"📋"]
                  ].map(([l,v,ic])=>(
                    <div key={l} style={{background:"rgba(255,255,255,.1)",borderRadius:"8px",padding:"10px 12px",border:"1px solid rgba(255,255,255,.2)"}}>
                      <div style={{fontSize:FS.xs,opacity:.7,marginBottom:"2px"}}>{ic} {l}</div>
                      <div style={{fontWeight:700,fontSize:FS.sm,lineHeight:1.3}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Section 1: Design & Monitoring Framework ── */}
              <div style={s.card}>
                <div style={{...s.cardHead,background:"#f0fdf4",borderRadius:"10px 10px 0 0",borderBottom:`1px solid #bbf7d0`}}>
                  <span style={{background:"#16a34a",color:"#fff",borderRadius:"5px",padding:"3px 10px",fontWeight:700,fontSize:FS.sm}}>DMF</span>
                  <span style={{fontWeight:700,fontSize:FS.lg,color:"#15803d"}}>Design & Monitoring Framework — Results Chain</span>
                </div>
                <div style={{...s.cardBody}}>
                  {/* Results chain: Impact → Outcome → Output → Activity */}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"0",border:`1px solid ${T.borderPrimary}`,borderRadius:"8px",overflow:"hidden"}}>
                    {[
                      {level:"🌏 Impact",bg:"#1e3a5f",color:"#fff",items:[
                        `ประเทศไทยอยู่ใน Top 35 Global Innovation Index`,
                        `มูลค่า ววน. เติบโตต่อเนื่อง`
                      ]},
                      {level:"🎯 Outcome",bg:"#1d4ed8",color:"#fff",items:sel.outcomes.map(o=>`${o.OutcomeName}: ${o.OutcomeAmount?.toLocaleString()||"—"} ${o.UnitCount}`)},
                      {level:"📦 Output",bg:"#eff6ff",color:T.navy,items:sel.outputs.map(o=>`${o.OutputName}: ${o.DeliveryAmount} ${o.UnitCount}`)},
                      {level:"⚙️ Activity",bg:T.bgSection,color:T.textPrimary,items:sel.milestones.map(m=>`${m.DeliveredOutput}: ${m.ActualOutputCount}/${m.QuantityOutput} ${m.KRType}`)},
                    ].map((col,ci)=>(
                      <div key={ci} style={{background:col.bg,padding:"14px 14px",borderRight:ci<3?`1px solid ${T.borderPrimary}`:"none"}}>
                        <div style={{fontWeight:800,fontSize:FS.sm,color:col.color,marginBottom:"10px",textTransform:"uppercase",letterSpacing:".06em",opacity:.9}}>{col.level}</div>
                        {col.items.map((item,ii)=>(
                          <div key={ii} style={{fontSize:FS.sm,color:col.color,opacity:.9,padding:"5px 0",borderBottom:`1px solid ${ci<2?"rgba(255,255,255,.15)":T.borderLight}`,lineHeight:1.5}}>{item}</div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:"10px",fontSize:FS.xs,color:T.textMuted,fontStyle:"italic"}}>
                    * DMF ตาม ADB standard — Impact level อ้างอิง KPI ระดับชาติ (GII rank, ดัชนี ววน.)
                  </div>
                </div>
              </div>

              {/* ── Section 2: Evaluation Criteria ── */}
              <div style={s.card}>
                <div style={{...s.cardHead,background:"#faf5ff",borderRadius:"10px 10px 0 0",borderBottom:`1px solid #e9d5ff`}}>
                  <span style={{background:"#7c3aed",color:"#fff",borderRadius:"5px",padding:"3px 10px",fontWeight:700,fontSize:FS.sm}}>CRITERIA</span>
                  <span style={{fontWeight:700,fontSize:FS.lg,color:"#6d28d9"}}>Evaluation Criteria — ADB 4-Point Scale</span>
                  <span style={{...s.fieldTag,marginLeft:"auto",fontSize:FS.xs}}>Highly Satisfactory ≥85 · Satisfactory 65–84 · Partly Satisfactory 50–64 · Unsatisfactory &lt;50</span>
                </div>
                <div style={s.cardBody}>
                  {/* Criterion cards */}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"12px",marginBottom:"16px"}}>
                    {criteriaRows.map(c=>(
                      <div key={c.id} style={{borderRadius:"10px",border:`1px solid ${c.si.border}`,borderTop:`4px solid ${c.si.color}`,overflow:"hidden"}}>
                        <div style={{background:c.si.bg,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div>
                            <div style={{fontWeight:800,fontSize:FS.base,color:c.si.color}}>{c.id}: {c.labelTh}</div>
                            <div style={{fontSize:FS.xs,color:T.textMuted,marginTop:"2px"}}>Weight: {(c.weight*100).toFixed(0)}% · Source: <span style={{fontFamily:"monospace"}}>{c.source}</span></div>
                          </div>
                          <div style={{textAlign:"center"}}>
                            <div style={{fontWeight:900,fontSize:"32px",color:c.si.color,lineHeight:1}}>{c.score}</div>
                            <div style={{fontSize:FS.xs,fontWeight:700,color:c.si.color,background:"#fff",borderRadius:"4px",padding:"2px 8px",marginTop:"3px",border:`1px solid ${c.si.border}`}}>{c.si.label}</div>
                          </div>
                        </div>
                        <div style={{padding:"12px 16px",background:T.bgDefault}}>
                          <div style={{fontSize:FS.xs,color:"#6d28d9",fontWeight:700,marginBottom:"4px"}}>ADB Definition</div>
                          <div style={{fontSize:FS.sm,color:T.textSecondary,lineHeight:1.6,marginBottom:"10px"}}>{c.adbDef}</div>
                          <div style={{fontSize:FS.xs,color:T.navy,fontWeight:700,marginBottom:"4px"}}>🔍 Findings</div>
                          <div style={{fontSize:FS.sm,color:T.textPrimary,lineHeight:1.6,padding:"8px 12px",background:T.bgSection,borderRadius:"6px",border:`1px solid ${T.borderLight}`}}>{c.finding}</div>
                          {/* score bar */}
                          <div style={{marginTop:"10px",display:"flex",alignItems:"center",gap:"8px"}}>
                            <div style={{flex:1,background:T.borderLight,borderRadius:"99px",height:"6px"}}>
                              <div style={{width:`${c.score}%`,height:"6px",borderRadius:"99px",background:c.si.color,transition:"width .5s"}}/>
                            </div>
                            <span style={{fontSize:FS.xs,fontWeight:700,color:c.si.color,minWidth:"28px"}}>{c.score}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Criteria summary radar + bar */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
                    <div style={{background:T.bgSection,borderRadius:"8px",padding:"14px",border:`1px solid ${T.borderLight}`}}>
                      <div style={{fontWeight:700,fontSize:FS.base,color:T.navy,marginBottom:"10px"}}>📊 Criteria Spider Chart</div>
                      <ResponsiveContainer width="100%" height={180}>
                        <RadarChart data={criteriaRows.map(c=>({subject:c.label,value:c.score,fullMark:100}))}>
                          <PolarGrid stroke={T.borderPrimary}/>
                          <PolarAngleAxis dataKey="subject" tick={{fill:T.textSecondary,fontSize:12}}/>
                          <Radar dataKey="value" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.18} dot={{fill:"#7c3aed",r:3}}/>
                          <Tooltip contentStyle={tooltipStyle}/>
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{background:T.bgSection,borderRadius:"8px",padding:"14px",border:`1px solid ${T.borderLight}`}}>
                      <div style={{fontWeight:700,fontSize:FS.base,color:T.navy,marginBottom:"10px"}}>⚖️ Weighted Contribution</div>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={criteriaRows.map(c=>({name:c.label,score:c.score,weighted:Math.round(c.score*c.weight)}))} barSize={22} margin={{top:4,right:8,bottom:30,left:0}}>
                          <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight}/>
                          <XAxis dataKey="name" tick={{fill:T.textSecondary,fontSize:11}} angle={-20} textAnchor="end"/>
                          <YAxis tick={{fill:T.textSecondary,fontSize:11}} domain={[0,100]}/>
                          <Tooltip contentStyle={tooltipStyle} formatter={(v,n)=>[v,n==="score"?"Raw Score":"Weighted"]}/>
                          <Bar dataKey="score" name="Raw Score" fill={T.borderPrimary} radius={[4,4,0,0]} opacity={0.35}/>
                          <Bar dataKey="weighted" name="Weighted" fill="#7c3aed" radius={[4,4,0,0]}>
                            {criteriaRows.map((c,i)=><Cell key={i} fill={c.si.color}/>)}
                          </Bar>
                          <Legend wrapperStyle={{fontSize:FS.xs,paddingTop:"8px"}}/>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Section 3: Overall Rating Summary ── */}
              <div style={{...s.card,border:`2px solid ${adbSi.border}`}}>
                <div style={{...s.cardHead,background:adbSi.bg,borderRadius:"10px 10px 0 0"}}>
                  <span style={{fontWeight:800,fontSize:FS.lg,color:adbSi.color}}>📋 Overall Project Rating</span>
                  <span style={{marginLeft:"auto",fontWeight:700,fontSize:FS.base,color:adbSi.color,background:"#fff",borderRadius:"6px",padding:"4px 14px",border:`1px solid ${adbSi.border}`}}>{adbSi.label}</span>
                </div>
                <div style={s.cardBody}>
                  <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:"24px",alignItems:"center"}}>
                    {/* Big score */}
                    <div style={{textAlign:"center",padding:"20px 28px",background:adbSi.bg,borderRadius:"12px",border:`2px solid ${adbSi.border}`}}>
                      <div style={{fontSize:FS.xs,color:adbSi.color,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",marginBottom:"4px"}}>Composite Score</div>
                      <div style={{fontWeight:900,fontSize:"56px",color:adbSi.color,lineHeight:1}}>{adbFinal}</div>
                      <div style={{fontWeight:700,fontSize:FS.base,color:adbSi.color,marginTop:"6px"}}>{adbSi.adb}</div>
                      <div style={{marginTop:"12px",display:"flex",flexDirection:"column",gap:"4px"}}>
                        {[["ADB Scale","HS ≥85 / S 65–84 / PS 50–64 / U <50"],["Ref.","ADB Guidelines PSO (IED 2016)"]].map(([k,v])=>(
                          <div key={k} style={{fontSize:FS.xs,color:T.textMuted}}><span style={{fontWeight:700}}>{k}:</span> {v}</div>
                        ))}
                      </div>
                    </div>
                    {/* Criteria breakdown table */}
                    <div>
                      <table style={{width:"100%",borderCollapse:"collapse"}}>
                        <thead>
                          <tr style={{background:T.bgSection}}>
                            {["Criterion","Weight","Score","Weighted","Rating"].map(h=>(
                              <th key={h} style={{...s.th,textAlign:h==="Criterion"?"left":"center"}}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {criteriaRows.map((c,i)=>(
                            <tr key={c.id} style={{background:i%2===0?T.bgDefault:T.bgSection}}>
                              <td style={{...s.td,fontWeight:700}}><span style={{color:c.si.color}}>{c.id}</span> {c.label}</td>
                              <td style={{...s.td,textAlign:"center",color:T.textSecondary}}>{(c.weight*100).toFixed(0)}%</td>
                              <td style={{...s.td,textAlign:"center",fontWeight:700,color:c.si.color,fontSize:FS.md}}>{c.score}</td>
                              <td style={{...s.td,textAlign:"center",fontWeight:700,color:T.navy}}>{Math.round(c.score*c.weight)}</td>
                              <td style={{...s.td,textAlign:"center"}}><span style={{padding:"3px 10px",borderRadius:"5px",background:c.si.bg,border:`1px solid ${c.si.border}`,color:c.si.color,fontWeight:700,fontSize:FS.xs}}>{c.si.label}</span></td>
                            </tr>
                          ))}
                          <tr style={{background:"#fffbf0",fontWeight:800}}>
                            <td style={{...s.td,fontWeight:800,color:T.navy}} colSpan={2}>Overall (Weighted Average)</td>
                            <td style={{...s.td,textAlign:"center"}}></td>
                            <td style={{...s.td,textAlign:"center",fontWeight:900,fontSize:FS.lg,color:adbSi.color}}>{adbFinal}</td>
                            <td style={{...s.td,textAlign:"center"}}><span style={{padding:"4px 12px",borderRadius:"5px",background:adbSi.bg,border:`2px solid ${adbSi.border}`,color:adbSi.color,fontWeight:800,fontSize:FS.sm}}>{adbSi.label}</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Section 4: Key Findings & Recommendations ── */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
                {/* Strengths + Weaknesses */}
                <div style={s.card}>
                  <SectionHead icon="🔎" title="Key Findings"/>
                  <div style={s.cardBody}>
                    {strengths.length>0&&(
                      <div style={{marginBottom:"14px"}}>
                        <div style={{fontWeight:700,fontSize:FS.sm,color:T.green,marginBottom:"8px",textTransform:"uppercase",letterSpacing:".06em"}}>✅ Strengths</div>
                        {strengths.map((st,i)=>(
                          <div key={i} style={{padding:"9px 12px",background:"#f0fdf4",borderRadius:"7px",border:"1px solid #bbf7d0",marginBottom:"7px"}}>
                            <div style={{fontWeight:700,fontSize:FS.sm,color:"#15803d",marginBottom:"3px"}}>{st.label}{st.score!=null?` — ${st.score}/100`:""}</div>
                            <div style={{fontSize:FS.sm,color:T.textPrimary,lineHeight:1.55}}>{st.finding}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {weaknesses.length>0&&(
                      <div>
                        <div style={{fontWeight:700,fontSize:FS.sm,color:T.red,marginBottom:"8px",textTransform:"uppercase",letterSpacing:".06em"}}>⚠️ Areas for Improvement</div>
                        {weaknesses.map((wk,i)=>(
                          <div key={i} style={{padding:"9px 12px",background:"#fff7ed",borderRadius:"7px",border:"1px solid #fed7aa",marginBottom:"7px"}}>
                            <div style={{fontWeight:700,fontSize:FS.sm,color:"#c2410c",marginBottom:"3px"}}>{wk.label}{wk.score!=null?` — ${wk.score}/100`:""}</div>
                            <div style={{fontSize:FS.sm,color:T.textPrimary,lineHeight:1.55}}>{wk.finding}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Recommendations */}
                <div style={s.card}>
                  <SectionHead icon="💡" title="Recommendations"/>
                  <div style={s.cardBody}>
                    <div style={{fontSize:FS.xs,color:T.textMuted,marginBottom:"12px",fontStyle:"italic"}}>
                      อ้างอิง ADB PPER-PSO — Recommendations ควรระบุ Who, What, When ที่ชัดเจน
                    </div>
                    {recs.map((r,i)=>(
                      <div key={i} style={{padding:"12px 14px",borderRadius:"8px",background:T.bgSection,border:`1px solid ${T.borderPrimary}`,marginBottom:"8px",borderLeft:`4px solid #7c3aed`}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"5px"}}>
                          <span style={{fontWeight:700,fontSize:FS.sm,color:"#6d28d9"}}>{r.no}</span>
                          <span style={{fontSize:FS.xs,fontWeight:700,color:T.textSecondary,background:T.bgDefault,border:`1px solid ${T.borderLight}`,borderRadius:"4px",padding:"2px 8px"}}>{r.area}</span>
                        </div>
                        <div style={{fontSize:FS.base,color:T.textPrimary,lineHeight:1.6}}>{r.text}</div>
                      </div>
                    ))}

                    {/* Lessons Learned placeholder */}
                    <div style={{marginTop:"14px",padding:"12px 14px",background:"#fffbeb",borderRadius:"8px",border:"1px solid #fde68a"}}>
                      <div style={{fontWeight:700,fontSize:FS.sm,color:"#92400e",marginBottom:"6px"}}>📚 Lessons Learned (ADB PPER requirement)</div>
                      <div style={{fontSize:FS.sm,color:T.textPrimary,lineHeight:1.6}}>
                        {sc.effectiveness>=75 && sc.efficiency>=75
                          ? `${sel.shortName} เป็นตัวอย่าง best practice ด้าน budget execution และ milestone delivery ที่ควรถ่ายทอดไปยัง PMU อื่นผ่าน knowledge sharing platform`
                          : `บทเรียนสำคัญ: การวางแผน disbursement ล่วงหน้าและระบบติดตาม milestone รายเดือนช่วยลดความเสี่ยงด้าน efficiency ได้อย่างมีนัยสำคัญ`
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── PMU Comparison across ADB Criteria ── */}
              <div style={s.card}>
                <SectionHead icon="📊" title="All-PMU Comparison — ADB 4 Criteria"/>
                <div style={s.cardBody}>
                  <ResponsiveContainer width="100%" height={230}>
                    <BarChart
                      data={enriched.map(p=>({
                        name:p.shortName,
                        Relevance:p.scores.relevance,
                        Effectiveness:p.scores.effectiveness,
                        Efficiency:p.scores.efficiency,
                        Sustainability:p.scores.sustainability,
                        Overall:p.scores.final
                      }))}
                      barSize={9}
                      margin={{top:4,right:16,bottom:32,left:0}}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight}/>
                      <XAxis dataKey="name" tick={{fill:T.textSecondary,fontSize:12}} angle={-20} textAnchor="end" interval={0}/>
                      <YAxis tick={{fill:T.textSecondary,fontSize:12}} domain={[0,100]}/>
                      <Tooltip contentStyle={tooltipStyle}/>
                      <Legend wrapperStyle={{fontSize:FS.xs,paddingTop:"6px"}}/>
                      <Bar dataKey="Relevance"      fill="#7c3aed" radius={[2,2,0,0]}/>
                      <Bar dataKey="Effectiveness"  fill="#f97316" radius={[2,2,0,0]}/>
                      <Bar dataKey="Efficiency"     fill="#3b82f6" radius={[2,2,0,0]}/>
                      <Bar dataKey="Sustainability" fill="#16a34a" radius={[2,2,0,0]}/>
                      <Bar dataKey="Overall"        fill={T.navy}  radius={[2,2,0,0]} opacity={0.35}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
            );
          })()}


          {tab==="matrix" && <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            <div style={s.card}>
              <SectionHead icon="⚡" title="6-Pillar Score Matrix (ADB Framework) — คลิก PMU เพื่อดูรายละเอียด"/>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",minWidth:"820px"}}>
                  <thead><tr>
                    <th style={{...s.th,width:"80px"}}>PMU</th>
                    {PILLARS.map(m=><th key={m.key} style={{...s.th,textAlign:"center"}}><span style={{color:m.color}}>{m.icon} {m.label.split(" ")[0]}</span><br/><span style={{fontWeight:400,color:T.textMuted,fontSize:FS.xs}}>w={m.w} · {m.adbCrit}</span></th>)}
                    <th style={{...s.th,textAlign:"center",color:T.navy}}>Final</th>
                    <th style={{...s.th,textAlign:"center"}}>ADB Rating</th>
                  </tr></thead>
                  <tbody>
                    {[...enriched].sort((a,b)=>b.scores.final-a.scores.final).map((p,i)=>{
                      const a=p.id===selected;
                      const psi=scoreInfo(p.scores.final);
                      return <tr key={p.id} onClick={()=>{setSelected(p.id);setTab("overview");}} style={{cursor:"pointer",background:a?"#fff5f1":i%2===0?T.bgDefault:T.bgSection,borderLeft:a?`3px solid ${T.orange}`:"3px solid transparent"}}>
                        <td style={s.td}><div style={{fontWeight:700,color:a?T.orange:T.navy,fontSize:FS.md}}>{p.shortName}</div>{p.mergeGroup&&<div style={{fontSize:"10px",color:"#7c3aed",fontWeight:700}}>🔀 ควบรวม</div>}<div style={{fontSize:FS.xs,color:T.textMuted,marginTop:"1px"}}>{p.agent_type}</div></td>
                        {PILLARS.map(m=><td key={m.key} style={{...s.td,minWidth:"90px"}}><PillarBar score={p.scores[m.key]}/></td>)}
                        <td style={{...s.td,textAlign:"center"}}><span style={{fontWeight:700,fontSize:"20px",color:psi.color}}>{p.scores.final}</span></td>
                        <td style={{...s.td,textAlign:"center"}}><span style={{padding:"3px 10px",borderRadius:"5px",background:psi.bg,border:`1px solid ${psi.border}`,color:psi.color,fontWeight:700,fontSize:FS.xs}}>{psi.short}</span></td>
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
              <div style={s.card}>
                <SectionHead icon="🔍" title="Risk Matrix: P1 Budget vs P2 Milestone"/>
                <div style={s.cardBody}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px",marginBottom:"10px"}}>
                    {[["🏆 Champion","Budget+Milestone ดี",T.green],["🔶 Conservative","Milestone ดี งบเหลือ",T.yellow],["🔴 Double Risk","ทั้งสองต่ำ",T.red],["⚠️ Inefficient","งบหมดแต่งานไม่คืบ",T.orange]].map(([l,sub,c])=>(
                      <div key={l} style={{background:T.bgSection,borderRadius:"4px",padding:"7px 10px",border:`1px solid ${T.borderLight}`}}><div style={{fontWeight:700,color:c,fontSize:FS.sm}}>{l}</div><div style={{color:T.textMuted,fontSize:FS.xs,marginTop:"1px"}}>{sub}</div></div>
                    ))}
                  </div>
                  <ResponsiveContainer width="100%" height={175}>
                    <ScatterChart margin={{top:10,right:20,bottom:20,left:0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight}/>
                      <XAxis dataKey="x" type="number" domain={[0,110]} tick={{fill:T.textSecondary,fontSize:12}} label={{value:"P1 Budget",fill:T.textMuted,fontSize:11,position:"insideBottom",offset:-10}}/>
                      <YAxis dataKey="y" type="number" domain={[0,110]} tick={{fill:T.textSecondary,fontSize:12}}/>
                      <ZAxis range={[55,55]}/>
                      <Tooltip content={({payload})=>payload?.length?<div style={{...tooltipStyle,background:T.bgDefault}}><div style={{fontWeight:700,color:T.navy,fontSize:FS.base}}>{payload[0].payload.name}</div><div style={{color:"#3b82f6",fontSize:FS.sm}}>P1: {payload[0].payload.x}</div><div style={{color:T.orange,fontSize:FS.sm}}>P2: {payload[0].payload.y}</div><div style={{color:scoreInfo(payload[0].payload.final).color,fontSize:FS.sm}}>Final: {payload[0].payload.final}</div></div>:null}/>
                      <Scatter data={scatter} shape={(props)=>{
                        const {cx,cy,payload}=props;
                        const c=scoreInfo(payload.final).color;
                        return <g><circle cx={cx} cy={cy} r={8} fill={c} fillOpacity={0.85} stroke={payload.id===selected?"#000":"none"} strokeWidth={2}/><text x={cx} y={cy-12} textAnchor="middle" fill={T.textPrimary} fontSize={11} fontWeight={700}>{payload.name}</text></g>;
                      }}/>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={s.card}>
                <SectionHead icon="📊" title="เปรียบเทียบ 6 Pillar ทุก PMU"/>
                <div style={s.cardBody}>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={enriched.map(p=>({name:p.shortName,P0:p.scores.p0,P1:p.scores.p1,P2:p.scores.p2,P3:p.scores.p3,P4:p.scores.p4,P5:p.scores.p5}))} barSize={6} margin={{top:0,right:10,bottom:30,left:-10}}>
                      <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight}/>
                      <XAxis dataKey="name" tick={{fill:T.textSecondary,fontSize:12}} angle={-25} textAnchor="end" interval={0}/>
                      <YAxis tick={{fill:T.textSecondary,fontSize:12}} domain={[0,100]}/>
                      <Tooltip contentStyle={tooltipStyle}/>
                      {PILLARS.map(m=><Bar key={m.key} dataKey={m.key.toUpperCase()} name={m.label} fill={m.color} opacity={0.85}/>)}
                      <Legend wrapperStyle={{fontSize:FS.sm,paddingTop:"8px"}}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Field mapping */}
            <div style={s.card}>
              <SectionHead icon="📌" title="Field Mapping Reference — API → 6 Pillar (ADB Framework)"/>
              <div style={{...s.cardBody,display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:"10px"}}>
                {[
                  {pillar:"P0 Relevance",adb:"ADB C1",color:"#7c3aed",api:"stvn[]",fields:["strategy (S1–S4)","plans[] count","flagship","mergeGroup bonus","แผนด้าน ววน. 2566–2570"]},
                  {pillar:"P1 Budget",adb:"ADB C3",color:"#3b82f6",api:"/tsriis-report-withdraw",fields:["total","withdraw_total","refund_total","balance","withdraw[].budget_plan","withdraw[].withdraw","reprogramming"]},
                  {pillar:"P2 Milestone",adb:"ADB C2a",color:"#f97316",api:"/milestone",fields:["QuantityOutput","ActualOutputCount","DeliveredOutput","KRType","operYearlyGoal[]"]},
                  {pillar:"P3 Contract",adb:"ADB C4a",color:"#152c65",api:"/tsriis-report-withdraw",fields:["contract_extension_count","contract_extension_status","status","contract_enddate"]},
                  {pillar:"P4 Output",adb:"ADB C2b",color:"#16a34a",api:"/milestone",fields:["output[].DeliveryAmount","outcome[].OutcomeAmount","targetBenef[].TargetBenefNum","impact[]"]},
                  {pillar:"P5 Leverage",adb:"ADB C4b",color:"#8b5cf6",api:"/in-cash-inkind",fields:["InCash","InKind","organization[].inCash","BudgetGrant"]},
                ].map(({pillar,adb,color,api,fields})=>(
                  <div key={pillar} style={{background:T.bgSection,borderRadius:"8px",padding:"12px 14px",border:`1px solid ${T.borderPrimary}`,borderTop:`3px solid ${color}`}}>
                    <div style={{fontWeight:700,fontSize:FS.base,color,marginBottom:"2px"}}>{pillar}</div>
                    <div style={{fontSize:FS.xs,fontWeight:700,color:T.textSecondary,marginBottom:"6px"}}>{adb}</div>
                    <div style={{...s.label,marginBottom:"10px"}}>{api}</div>
                    {fields.map(f=><div key={f} style={{...s.label,padding:"4px 0",borderBottom:`1px solid ${T.borderLight}`}}>{f}</div>)}
                  </div>
                ))}
              </div>
            </div>
          </div>}

          </div>{/* end main */}
        </div>{/* end layout */}
    </div>
  );
}
