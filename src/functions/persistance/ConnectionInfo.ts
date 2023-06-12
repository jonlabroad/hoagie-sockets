export type TopicType = string

export interface ConnectionInfo<TData = any> {
    id: string
    topic: TopicType
    endpoint: string
    timestamp: number
    data: TData
}