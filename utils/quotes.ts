export interface Quote {
  id: string;
  text: string;
  author: string;
  category: 'stoic' | 'intention' | 'time';
}

export const QUOTES: Quote[] = [
  {
    id: 'seneca-1',
    text: "We are not given a short life but we make it short, and we are not ill-provided but wasteful of it.",
    author: "Seneca",
    category: "time"
  },
  {
    id: 'seneca-2',
    text: "People are frugal in guarding their personal property; but as soon as it comes to squandering time they are wasteful of the one thing in which it is right to be sordid.",
    author: "Seneca",
    category: "time"
  },
  {
    id: 'marcus-1',
    text: "You could leave life right now. Let that determine what you do and say and think.",
    author: "Marcus Aurelius",
    category: "stoic"
  },
  {
    id: 'marcus-2',
    text: "Concentrate every minute like a Roman—on doing what’s in front of you with precise and genuine seriousness, tenderly, willingly, with justice.",
    author: "Marcus Aurelius",
    category: "stoic"
  },
  {
    id: 'steve-jobs',
    text: "Remembering that you are going to die is the best way I know to avoid the trap of thinking you have something to lose. You are already naked.",
    author: "Steve Jobs",
    category: "intention"
  },
  {
    id: 'seneca-3',
    text: "Let us prepare our minds as if we’d come to the very end of life. Let us postpone nothing. Let us balance life’s books each day.",
    author: "Seneca",
    category: "stoic"
  },
  {
    id: 'epictetus-1',
    text: "Keep death and exile before your eyes each day. By doing so, you will never have a base thought nor will you have excessive desire.",
    author: "Epictetus",
    category: "stoic"
  },
  {
    id: 'gandhi',
    text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    author: "Mahatma Gandhi",
    category: "intention"
  },
  {
    id: 'annie-dillard',
    text: "How we spend our days is, of course, how we spend our lives.",
    author: "Annie Dillard",
    category: "intention"
  },
  {
    id: 'memento-mori',
    text: "Memento Mori. Remember that you must die. Live with profound and elegant intention.",
    author: "Stoic Proverb",
    category: "stoic"
  },
  {
    id: 'tempus-fugit',
    text: "Tempus fugit, amor manet. Time flies, love remains.",
    author: "Latin Proverb",
    category: "time"
  },
  {
    id: 'marcus-3',
    text: "Think of yourself as dead. You have lived your life. Now, take what's left and live it properly.",
    author: "Marcus Aurelius",
    category: "stoic"
  },
  {
    id: 'seneca-4',
    text: "It is not that we have a short time to live, but that we waste a lot of it.",
    author: "Seneca",
    category: "time"
  }
];

export function getRandomQuote(category?: string): Quote {
  const filtered = category && category !== 'all'
    ? QUOTES.filter(q => q.category === category)
    : QUOTES;
  const index = Math.floor(Math.random() * filtered.length);
  return filtered[index] || QUOTES[0];
}
