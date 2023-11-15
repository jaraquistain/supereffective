export type CollectionItem = { id: string }
export type Collection = CollectionItem[]

export interface SearchEngine<C extends Collection = Collection> {
  readonly algo: SearchWorkerAlgorithm

  build(collection: C, properties: any[]): SearchEngine<C>

  search(text: string): Set<string>

  searchCollection<T extends Collection>(collection: T, text: string): T
}

export enum SearchWorkerAlgorithm {
  Trie = 'trie',
  Simple = 'simple',
}

export enum SearchWorkerAction {
  Index = 'index',
  Query = 'query',
}

export type SearchWorkerMessageEvent<Action> = MessageEvent<SearchWorkerActionPayload<Action>>

export type SearchWorkerActionPayload<Action> = Action extends SearchWorkerAction.Index
  ? {
      type: SearchWorkerAction.Index
      algo: SearchWorkerAlgorithm
      data: {
        collection: Collection
        properties: string[]
      }
    }
  : Action extends SearchWorkerAction.Query
  ? {
      type: SearchWorkerAction.Query
      algo: SearchWorkerAlgorithm
      data: {
        collection: Collection
        engine: SearchEngine
        query: string
      }
    }
  : never
