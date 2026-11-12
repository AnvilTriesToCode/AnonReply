'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { createInstantUser } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Zap, Loader2, Check, Copy, AlertCircle, Shield } from 'lucide-react';

interface InstantAccountButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  text?: string;
  redirectTo?: string;
}

export default function InstantAccountButton({
  className,
  variant = 'default',
  size = 'default',
  text = '⚡ Use Services Immediately (Auto-Generate Account)',
  redirectTo = '/dashboard',
}: InstantAccountButtonProps) {
  const [loading, setLoading] = useState(false);
  const [generatedUsername, setGeneratedUsername] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await createInstantUser();
      if (res.success && res.username) {
        setGeneratedUsername(res.username);
      } else {
        alert(res.error || 'Failed to create instant account');
      }
    } catch {
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedUsername) {
      navigator.clipboard.writeText(generatedUsername);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirmAndProceed = async () => {
    if (!generatedUsername) return;
    setSigningIn(true);

    try {
      const result = await signIn('credentials', {
        username: generatedUsername,
        redirect: false,
      });

      if (result?.ok) {
        router.push(redirectTo);
        router.refresh();
      } else {
        alert('Could not sign in with generated account. Please try again.');
        setSigningIn(false);
      }
    } catch {
      alert('Sign-in error occurred.');
      setSigningIn(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleGenerate}
        disabled={loading}
        className={className}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Account...
          </>
        ) : (
          text
        )}
      </Button>

      {/* Prompt / Modal to Show Account Name and Ask User to Remember It */}
      {generatedUsername && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in-0">
          <Card className="w-full max-w-md shadow-2xl border-2 border-primary/30">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Your Anonymous Account is Ready!</CardTitle>
              <CardDescription>
                Please remember your unique username. No password is required.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              <div className="rounded-xl border bg-muted/60 p-4 text-center space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Your Account Username
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-2xl font-bold tracking-tight text-primary">
                    {generatedUsername}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="h-8 w-8"
                    title="Copy username"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {copied && (
                  <p className="text-xs text-green-600 font-medium">Copied to clipboard!</p>
                )}
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <p>
                  <strong>Important:</strong> Please write down or remember this username. Whenever
                  you want to check responses from the Support Team or return to your conversations, simply
                  enter this username to sign back in!
                </p>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                onClick={handleConfirmAndProceed}
                disabled={signingIn}
                className="w-full h-11 text-base font-semibold"
              >
                {signingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entering Platform...
                  </>
                ) : (
                  'OK, I Remember It — Enter Platform'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}
