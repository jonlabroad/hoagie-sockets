export interface HoagieTopicEvent<T = any> {
    topic: string
    type: string
    data: T
  }