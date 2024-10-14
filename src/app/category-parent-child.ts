

export interface CategoryParentChild {
    id: string;
    name: string;
    description: string | null;
    parentId: string | null;
    children?: CategoryParentChild[];
    total?: number;
    [key: string]: any;
  }
  