export interface Todo {
  _id: string;
  owner: string;
  status: boolean;
  body: string;
  category: string;
  sortby: SortBy;
}

export type SortBy = "owner" | 'category' | 'body' | 'status' | '_id';
