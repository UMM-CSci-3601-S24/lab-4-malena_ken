export interface Todo {
  _id: string;
  owner: string;
  status: boolean;
  body: string;
  category: string;
  sortBy: SortBy;
}

export type SortBy = "owner" | 'category' | 'body' | 'status' | '_id';
