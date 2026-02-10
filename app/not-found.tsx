import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Match Not Found',
  description: 'The match you are looking for could not be found.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-xl text-muted">Match not found</p>
      </div>
    </div>
  );
}
