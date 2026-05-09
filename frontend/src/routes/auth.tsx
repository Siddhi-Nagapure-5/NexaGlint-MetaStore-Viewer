import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Cloud, LayoutDashboard, Key, ShieldCheck, Mail, Lock, AlertCircle, ArrowRight, Layers, Globe, ChevronDown, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { authApi, setToken, USER_KEY, getToken } from "@/lib/api";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

type AuthMode = "login" | "register" | "cloud";

function AuthPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");

  // Form state
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [name,     setName]     = useState("");
  
  // Cloud Login state
  const [awsAccessKey, setAwsAccessKey] = useState("");
  const [awsSecretKey, setAwsSecretKey] = useState("");
  const [awsRegion,    setAwsRegion]    = useState("us-east-1");

  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState("");

  const [previewUrl, setPreviewUrl] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (getToken()) router.navigate({ to: "/dashboard" });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let res;
      if (mode === "register") {
        if (!otpMode) {
          if (password !== confirmPassword) {
            throw new Error("Passwords do not match. Please confirm your credentials.");
          }
          // Request backend to send actual email
          const otpRes = await authApi.sendOtp(email);
          if (otpRes.preview_url) {
            setPreviewUrl(otpRes.preview_url);
          }
          setOtpMode(true);
          setLoading(false);
          return;
        } else {
          if (otp.length < 6) {
            throw new Error("Please enter a valid 6-digit verification code.");
          }
          res = await authApi.register(email, password, name, otp);
        }
      } else if (mode === "login") {
        res = await authApi.login(email, password);
      } else {
        res = await authApi.awsLogin(awsAccessKey, awsSecretKey, awsRegion);
      }

      setToken(res.access_token);
      
      const userData = {
        ...res.user,
        ...(mode === "cloud" ? { 
          aws_access_key: awsAccessKey, 
          aws_secret_key: awsSecretKey, 
          aws_region: awsRegion 
        } : {})
      };
      
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      router.navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#05050a] text-white overflow-hidden relative font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse duration-[10s]" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse duration-[8s]" />

      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-[45%] relative border-r border-white/5 items-center justify-center p-12 overflow-hidden z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className={`relative z-10 max-w-lg transition-all duration-1000 transform ${mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 mb-8 backdrop-blur-md">
            <Sparkles className="size-3" /> Built for Modern Data Lakes
          </div>
          <div className="size-16 rounded-2xl grid place-items-center bg-gradient-to-b from-cyan-400 to-blue-600 mb-8 shadow-[0_0_40px_rgba(34,211,238,0.4)]">
            <Layers className="size-8 text-[#05050a]" strokeWidth={2.5} />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            Unlock your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 drop-shadow-sm">Metastore Intelligence</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-md">
            Instantly inspect schema, snapshots, and metrics for Iceberg, Delta, and Hudi tables directly from S3.
          </p>

          <div className="mt-12 space-y-4">
            {[
              { icon: Cloud, text: "Zero-Compute Metadata Scanning" },
              { icon: ShieldCheck, text: "IAM-Based Secure Login" },
              { icon: Sparkles, text: "Automated Format Detection" }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                <div className="size-6 rounded-lg bg-white/5 border border-white/10 grid place-items-center">
                  <feature.icon className="size-3.5 text-cyan-400" />
                </div>
                {feature.text}
              </div>
            ))}
          </div>

          <div className="mt-12 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <p className="text-xs text-cyan-400 font-bold uppercase tracking-wider mb-2">Internal Demo Access</p>
            <div className="flex items-center justify-between font-mono text-xs text-gray-400">
              <span>demo@nexaglint.io</span>
              <span className="text-gray-600">/</span>
              <span>nexaglint123</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Card */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <Link to="/" className="absolute top-8 left-8 lg:left-auto lg:right-12 text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
          ← Back home
        </Link>

        <div className={`w-full max-w-[440px] transition-all duration-1000 delay-300 transform ${mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
          
          {/* Mode Switcher */}
          {!otpMode && (
            <div className="flex p-1.5 bg-white/5 border border-white/10 rounded-2xl mb-8 relative">
              <div 
                className="absolute h-[calc(100%-12px)] bg-white/10 border border-white/10 rounded-xl transition-all duration-300 shadow-xl"
                style={{ 
                  width: "calc(33.33% - 8px)", 
                  left: mode === "login" ? "6px" : mode === "register" ? "33.33%" : "66.66%",
                }} 
              />
              <button onClick={() => { setMode("login"); setError(null); }} className={`relative z-10 flex-1 py-2 text-sm font-bold transition-colors ${mode === "login" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}>Login</button>
              <button onClick={() => { setMode("register"); setError(null); }} className={`relative z-10 flex-1 py-2 text-sm font-bold transition-colors ${mode === "register" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}>Sign Up</button>
              <button onClick={() => { setMode("cloud"); setError(null); }} className={`relative z-10 flex-1 py-2 text-sm font-bold transition-colors ${mode === "cloud" ? "text-white" : "text-gray-500 hover:text-gray-300"} flex items-center justify-center gap-1.5`}>
                <Cloud className="size-3.5" /> Cloud
              </button>
            </div>
          )}

          <div className="glass-strong rounded-[2.5rem] p-8 sm:p-10 border border-white/10 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] bg-white/5 backdrop-blur-3xl relative overflow-hidden">
            
            {/* Header */}
            <div className="mb-8 text-center relative z-10">
              <h2 className="text-3xl font-bold tracking-tight mb-2 text-white">
                {otpMode ? "Verify Email" : mode === "login" ? "Welcome Back" : mode === "register" ? "Get Started" : "Cloud Login"}
              </h2>
              <p className="text-sm text-gray-400">
                {otpMode ? "We've sent a 6-digit code to your email." :
                 mode === "login" ? "Access your dashboard" : 
                 mode === "register" ? "Create your free account" : 
                 "Sign in with AWS IAM"}
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3.5 mb-6 relative z-10 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-red-300 leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              {otpMode ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="flex justify-center mb-4">
                    <div className="size-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 grid place-items-center">
                      <Mail className="size-8 text-cyan-400" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 text-center block">6-Digit Verification Code</label>
                    <Input
                      type="text" value={otp} onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456" maxLength={6}
                      className="h-14 text-center text-2xl tracking-[0.5em] font-mono bg-black/40 border-white/5 focus-visible:ring-cyan-500 text-white rounded-xl"
                      required
                    />
                  </div>
                  {previewUrl && (
                    <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="block w-full py-2 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-center text-xs font-bold rounded-lg hover:bg-purple-500/20 transition-colors">
                      🚀 Click here to open your Ethereal Test Inbox!
                    </a>
                  )}
                  <button type="button" onClick={() => setOtpMode(false)} className="text-xs text-gray-500 hover:text-white w-full text-center transition-colors">
                    Didn't receive a code? Try again
                  </button>
                </div>
              ) : mode === "register" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                  <Input
                    value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="h-12 bg-black/40 border-white/5 focus-visible:ring-cyan-500 text-white rounded-xl pl-4"
                    required
                  />
                </div>
              )}

              {!otpMode && mode !== "cloud" ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                    <Input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="h-12 bg-black/40 border-white/5 focus-visible:ring-cyan-500 text-white rounded-xl pl-4"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                    <Input
                      type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-12 bg-black/40 border-white/5 focus-visible:ring-cyan-500 text-white rounded-xl pl-4"
                      required minLength={6}
                    />
                  </div>

                  {mode === "register" && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Confirm Password</label>
                      <Input
                        type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-12 bg-black/40 border-white/5 focus-visible:ring-cyan-500 text-white rounded-xl pl-4"
                        required minLength={6}
                      />
                    </div>
                  )}
                </>
              ) : !otpMode && mode === "cloud" ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">AWS Access Key</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-600" />
                      <Input
                        value={awsAccessKey} onChange={(e) => setAwsAccessKey(e.target.value)}
                        placeholder="AKIA..."
                        className="h-12 bg-black/40 border-white/5 focus-visible:ring-cyan-500 text-white rounded-xl pl-11"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">AWS Secret Key</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-600" />
                      <Input
                        type="password" value={awsSecretKey} onChange={(e) => setAwsSecretKey(e.target.value)}
                        placeholder="••••••••••••••••"
                        className="h-12 bg-black/40 border-white/5 focus-visible:ring-cyan-500 text-white rounded-xl pl-11"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">AWS Region</label>
                    <Select value={awsRegion} onValueChange={setAwsRegion}>
                      <SelectTrigger className="h-12 bg-black/40 border-white/5 focus:ring-cyan-500 text-white rounded-xl pl-4 pr-4">
                        <div className="flex items-center gap-3">
                          <Globe className="size-4 text-gray-600" />
                          <SelectValue placeholder="Select region" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-[#0f111a] border-white/10 text-white">
                        <SelectGroup>
                          <SelectLabel className="text-gray-500">North America</SelectLabel>
                          <SelectItem value="us-east-1">us-east-1 (N. Virginia)</SelectItem>
                          <SelectItem value="us-east-2">us-east-2 (Ohio)</SelectItem>
                          <SelectItem value="us-west-1">us-west-1 (N. California)</SelectItem>
                          <SelectItem value="us-west-2">us-west-2 (Oregon)</SelectItem>
                          <SelectItem value="ca-central-1">ca-central-1 (Central)</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-gray-500">Asia Pacific</SelectLabel>
                          <SelectItem value="ap-south-1">ap-south-1 (Mumbai)</SelectItem>
                          <SelectItem value="ap-southeast-1">ap-southeast-1 (Singapore)</SelectItem>
                          <SelectItem value="ap-southeast-2">ap-southeast-2 (Sydney)</SelectItem>
                          <SelectItem value="ap-northeast-1">ap-northeast-1 (Tokyo)</SelectItem>
                          <SelectItem value="ap-northeast-2">ap-northeast-2 (Seoul)</SelectItem>
                          <SelectItem value="ap-east-1">ap-east-1 (Hong Kong)</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-gray-500">Europe</SelectLabel>
                          <SelectItem value="eu-west-1">eu-west-1 (Ireland)</SelectItem>
                          <SelectItem value="eu-west-2">eu-west-2 (London)</SelectItem>
                          <SelectItem value="eu-west-3">eu-west-3 (Paris)</SelectItem>
                          <SelectItem value="eu-central-1">eu-central-1 (Frankfurt)</SelectItem>
                          <SelectItem value="eu-north-1">eu-north-1 (Stockholm)</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-gray-500">Other</SelectLabel>
                          <SelectItem value="sa-east-1">sa-east-1 (São Paulo)</SelectItem>
                          <SelectItem value="af-south-1">af-south-1 (Cape Town)</SelectItem>
                          <SelectItem value="me-south-1">me-south-1 (Bahrain)</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : null}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl border-0 font-bold text-base transition-all hover:scale-[1.02] hover:shadow-[0_20px_40px_-10px_rgba(34,211,238,0.4)] bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-white mt-4 disabled:opacity-60"
              >
                {loading ? (
                  <><Loader2 className="size-5 mr-2 animate-spin" /> {otpMode ? "Verifying..." : mode === "cloud" ? "Verifying..." : "Authenticating..."}</>
                ) : (
                  <>{otpMode ? "Verify & Register" : mode === "cloud" ? "Secure Cloud Login" : mode === "login" ? "Sign In" : "Create Account"} <ArrowRight className="size-5 ml-2" /></>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
