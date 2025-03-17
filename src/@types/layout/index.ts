export interface LayoutBody {
  type: 'banner' | 'category' | 'faq';
  banner?: {
    title: string;
    subTitle: string;
    image: string;
  };
  category?: string[];
  faq?: {
    question: string;
    answer: string;
  }[];
}
