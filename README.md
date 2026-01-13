# Smart Issue Board

A premium, intelligent issue tracking system built with Next.js and Firebase.

## 🚀 Tech Stack & Justification

- **Frontend**: Next.js 15 (App Router).
  - *Why?* I chose Next.js for its robust routing, server-side rendering capabilities (good for SEO), and simple deployment to Vercel. It provides a solid foundation for a "complex web app", ensuring high performance and scalability.
- **Styling**: Tailwind CSS v4 + Custom CSS Variables.
  - *Why?* To achieve a premium "Glassmorphism" aesthetic with speed and consistency. Tailwind allowed for rapid development of responsive layouts, while custom CSS variables enabled a sophisticated, maintainable dark theme that feels modern and unique.
- **Backend**: Firebase Firestore & Auth.
  - *Why?* Provides a serverless, real-time database perfect for collaborative tools like issue boards. It simplifies the backend complexity, allowing focus on frontend UX.
- **Icons**: Lucide React.
  - *Why?* Clean, consistent SVG icons that match the modern specific aesthetic.

## 🗄 Firestore Data Structure

I used a single collection `issues` for simplicity and speed, containing documents with the following structure:

```typescript
type Issue = {
  id: string;          // Auto-generated Document ID
  title: string;       // String
  description: string; // String
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Done';
  assignedTo: string;  // Email string
  createdAt: number;   // Timestamp (Date.now())
  createdBy: string;   // Email string
}
```

This flat structure allows for easy querying, sorting, and real-time updates without complex joins, which fits the "Street-smart" requirement of avoiding over-engineering.

## 🧠 Similar Issue Handling

To prevent duplicate administrative work, the app performs an intelligent check when a user types a title for a new issue.

**Algorithm:**
1. On the client side, I fetch the headers of recent issues (limit 100) when the "Create" page loads.
2. As the user types the title, a real-time heuristic checks against existing titles:
   - **Direct Matches**: Checks if the new title is a substring of an existing one (or vice versa).
   - **Keyword Overlap**: Splits the title into significant words ( > 2 chars) and checks if an existing issue shares at least 2 significant words.
3. **UX**: If a match is found, a non-intrusive "Potential duplicates detected" warning appears with links to the similar issues, but does not block the user from proceeding if they are sure.

This approach is efficient (client-side) and immediate, providing feedback without waiting for backend search service responses.

## ⚠️ Challenges

- **Tailwind v4 Integration**: Configuring the alpha/beta version of Tailwind v4 with Next.js was tricky. It required manual setup of CSS variables and careful handling of directives to ensure the glassmorphism effects rendered correctly across all browsers.
- **Client-Side Search**: Implementing a "street smart" search and similarity check purely on the client-side without a heavy backend search engine required creative use of Javascript algorithms to ensure it remained performant even with a growing list of issues.
- **Authentication State**: Managing the user's session state to prevent "flashing" of protected content before redirecting unauthenticated users required robust use of React Context and Next.js routing hooks.

## 🔮 Future Improvements

1. **Comments System**: Allow users to discuss issues in a sub-collection.
2. **Drag and Drop Board**: Replace the grid view with a Kanban-style drag-and-drop board (using `dnd-kit`).
3. **Rich Text Editor**: Upgrade the description textarea to a markdown editor.
4. **Backend Search**: For scaling beyond 100s of issues, implement Algolia or Typesense for fuzzy search.

## 🛠 Setup & Deployment

1. **Clone the repo**
2. **Install dependencies**: `npm install`
3. **Environment Variables**:
   Copy `.env.example` to `.env.local` and add your Firebase config:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   ...
   ```
4. **Run Locally**: `npm run dev`
5. **Deploy**: Push to GitHub and import the repository into Vercel. Add the same Environment Variables in the Vercel dashboard.
# Smart-Issue-Board
