// app/routes/api.test.tsx
import { json } from '@remix-run/node';

export function loader() {
  return json({ message: "API is working!" });
}