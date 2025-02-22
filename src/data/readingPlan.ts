
export interface ReadingPlanDay {
  day: number;
  references: string[];
  title: string;
  description?: string;
}

export const readingPlanData: ReadingPlanDay[] = [
  {
    day: 1,
    references: ['Genesis 1:1-2:25'],
    title: 'The Creation',
    description: 'God creates the heavens and the earth'
  },
  {
    day: 2,
    references: ['Genesis 3:1-24', 'Genesis 4:1-26'],
    title: 'The Fall and Its Aftermath',
    description: 'Adam and Eve sin; Cain and Abel'
  },
  {
    day: 3,
    references: ['Genesis 5:1-32', 'Genesis 6:1-22'],
    title: 'Noah and the Flood Beginning',
    description: 'Genealogy from Adam to Noah; God sees corruption on earth'
  },
  {
    day: 4,
    references: ['Genesis 7:1-24', 'Genesis 8:1-22'],
    title: 'The Flood',
    description: 'The flood begins and ends; Noahs ark'
  },
  {
    day: 5,
    references: ['Genesis 9:1-29', 'Genesis 10:1-32'],
    title: 'Gods Covenant with Noah',
    description: 'Rainbow covenant; Noahs descendants'
  }
];
