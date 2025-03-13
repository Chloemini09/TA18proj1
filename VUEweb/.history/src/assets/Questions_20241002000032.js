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
  },
  {
    text: "Do you feel sad?",
    options: [
      { text: "I don't feel sad at all.", score: 5 },
      { text: "I sometimes feel sad.", score: 3 },
      { text: "I always feel sad and cannot pull myself out of it.", score: 2 },
      { text: "I feel extreme sadness and cannot control myself.", score: 1 }
    ]
  },
  {
    text: "How is your appetite?",
    options: [
      { text: "My appetite is as good as ever.", score: 5 },
      { text: "My appetite is not as good as it used to be.", score: 3 },
      { text: "I have a poor appetite now.", score: 2 },
      { text: "I have no appetite for any food.", score: 1 }
    ]
  },
  {
    text: "Do you feel disappointed with yourself?",
    options: [
      { text: "I never feel deeply disappointed with myself.", score: 5 },
      { text: "I sometimes feel very disappointed with myself.", score: 3 },
      { text: "I feel disgusted with myself.", score: 2 },
      { text: "I hate myself deeply.", score: 1 }
    ]
  },
  {
    text: "What is your current emotional state?",
    options: [
      { text: "I am not as easily irritated as before.", score: 5 },
      { text: "I get irritated more easily than before.", score: 3 },
      { text: "I am often easily angered.", score: 2 },
      { text: "I am always in a state of irritation.", score: 1 }
    ]
  },
  {
    text: "Do you feel guilty for what has happened?",
    options: [
      { text: "I never feel like I deserve punishment.", score: 5 },
      { text: "I feel like I might deserve punishment.", score: 3 },
      { text: "I expect others to punish me.", score: 2 },
      { text: "I feel I am currently being punished by others.", score: 1 }
    ]
  },
  {
    text: "Do you have biases toward people or things?",
    options: [
      { text: "I am as unbiased as I have always been.", score: 5 },
      { text: "I don’t appreciate things as much as I used to.", score: 3 },
      { text: "I can no longer feel satisfied with anything.", score: 2 },
      { text: "I am tired of everything.", score: 1 }
    ]
  }
]

export default questions;  // 使用 export default 导出题目数据