const questions = [
  {
    text: "Are you confident about the future?",
    options: [
      { text: "I have enough confidence in the future.", score: 5 },
      { text: "I am not confident about the future.", score: 3 },
      { text: "I feel there is nothing to expect from the future.", score: 2 },
      { text: "I feel the future is hopeless, and there is no chance for improvement.", score: 1 }
    ]
  },
  {
    text: "What is your current mindset about life?",
    options: [
      { text: "I never feel significantly worse than others.", score: 1 },
      { text: "I always feel inferior because of my flaws and mistakes.", score: 2 },
      { text: "I can never forgive myself for my mistakes.", score: 3 },
      { text: "I blame myself for all my faults.", score: 5 }
    ]
  },
  {
    text: "Do you often feel tired?",
    options: [
      { text: "I still feel as energetic as before.", score: 5 },
      { text: "I get tired more easily than before.", score: 3 },
      { text: "I get tired easily doing anything.", score: 2 },
      { text: "I always feel tired and don’t want to do anything.", score: 1 }
    ]
  },
  {
    text: "Do you have a sense of failure?",
    options: [
      { text: "I never feel like a failure.", score: 1 },
      { text: "I feel I fail more often than most people.", score: 2 },
      { text: "Looking back, I mostly recall moments of failure.", score: 3 },
      { text: "I feel I was born unworthy of being a person.", score: 5 }
    ]
  }
]

export default questions;  // 使用 export default 导出题目数据