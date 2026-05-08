import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Layers, Github, Mail, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen w-full flex bg-[#05050a] text-white overflow-hidden relative">
      {/* Global Ambient Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-1/2 relative border-r border-white/5 items-center justify-center p-12 overflow-hidden z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        <div className={`relative z-10 max-w-lg transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 mb-8 backdrop-blur-md">
            <Sparkles className="size-3" />
            Discover the invisible
          </div>

          <div className="size-16 rounded-[1.25rem] grid place-items-center bg-gradient-to-b from-[#00d2ff] to-[#007aff] mb-8 shadow-[0_0_40px_rgba(0,210,255,0.4)] relative">
            <div className="absolute inset-0 bg-white/10 rounded-[1.25rem] backdrop-blur-sm" />
            <Layers className="size-8 text-[#05050a] relative z-10" strokeWidth={2.5} />
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            The next-gen <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-sm">Lakehouse Explorer</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-md backdrop-blur-sm">
            Connect your object storage and instantly inspect Parquet, Iceberg, Delta, and Hudi tables. 
            <span className="text-gray-300"> No compute clusters required.</span>
          </p>
          
          <div className="mt-14 flex items-center gap-4 text-sm text-gray-500 font-medium">
            <div className="flex -space-x-3">
              <div className="size-10 rounded-full border-2 border-[#05050a] bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg relative z-30" />
              <div className="size-10 rounded-full border-2 border-[#05050a] bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg relative z-20" />
              <div className="size-10 rounded-full border-2 border-[#05050a] bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg relative z-10" />
            </div>
            Trusted by modern data teams
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative z-10">
        <Link to="/" className="absolute top-8 left-8 text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
          &larr; Back home
        </Link>
        
        <div className={`w-full max-w-md transition-all duration-1000 delay-300 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="glass-strong rounded-3xl p-8 sm:p-10 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] bg-white/5 backdrop-blur-2xl relative overflow-hidden">
            {/* Inner subtle glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 blur-[50px] rounded-full pointer-events-none" />

            <div className="mb-8 text-center relative z-10">
              <h2 className="text-3xl font-bold tracking-tight mb-2 text-white">Welcome back</h2>
              <p className="text-gray-400">Sign in to your NexaGlint account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5 relative z-10">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email address</label>
                <Input 
                  type="email" 
                  placeholder="name@company.com" 
                  className="h-12 bg-black/20 border-white/10 focus-visible:ring-cyan-500 text-white rounded-xl backdrop-blur-md transition-all hover:bg-black/30"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">Password</label>
                  <a href="#" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">Forgot password?</a>
                </div>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="h-12 bg-black/20 border-white/10 focus-visible:ring-cyan-500 text-white rounded-xl backdrop-blur-md transition-all hover:bg-black/30"
                  required
                />
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl border-0 font-semibold text-base transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white mt-6">
                Sign In <ArrowRight className="size-4 ml-2" />
              </Button>
            </form>

            <div className="my-8 flex items-center relative z-10">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10"></div>
              <span className="px-4 text-xs text-gray-500 uppercase tracking-widest font-medium">Or continue with</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10"></div>
            </div>

            <div className="grid grid-cols-2 gap-4 relative z-10">
              <Button variant="outline" className="h-11 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md transition-all hover:-translate-y-0.5">
                <Github className="size-4 mr-2" /> Github
              </Button>
              <Button variant="outline" className="h-11 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md transition-all hover:-translate-y-0.5">
                <Mail className="size-4 mr-2" /> Google
              </Button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-400">
            Don't have an account? <a href="#" className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors">Sign up for free</a>
          </p>
        </div>
      </div>
    </div>
  );
}
