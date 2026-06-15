import LoginForm from './LoginForm';

export const metadata = {
  title: 'Anmelden — sarahiver.de',
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  return <LoginForm linkError={sp?.error === 'link'} />;
}
