import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth-new";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BookOpen } from "lucide-react";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, login, register } = useAuth();

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Default role is 'student' - can be changed to allow user selection
      await register(email, password, fullName);
      toast({
        title: "Đăng ký thành công!",
        description: "Bạn đã có thể sử dụng tài khoản.",
      });
      navigate("/");
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.errors) {
        setError(err.response.data.errors.map((e: any) => e.msg).join(', '));
      } else {
        setError("Đã xảy ra lỗi. Vui lòng thử lại.");
      }
    }

    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Vui lòng điền email và mật khẩu");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log('Attempting login with:', { email, password: '***' });
      await login(email, password);
      console.log('Login successful! Check localStorage:', {
        token: localStorage.getItem('auth_token'),
        user: localStorage.getItem('user')
      });
      toast({
        title: "Đăng nhập thành công!",
        description: "Chào mừng bạn quay trở lại.",
        variant: "success",
      });
      // Tạm thời comment để xem log
      // navigate("/");
      setTimeout(() => {
        console.log('Redirecting to home...');
        navigate("/");
      }, 2000);
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Response:', err.response?.data);
      console.error('Status:', err.response?.status);
      
      if (err.response?.status === 401) {
        setError("Email hoặc mật khẩu không chính xác");
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError(`Lỗi kết nối: ${err.message || 'Vui lòng kiểm tra backend server'}`);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4"> 
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">EduShare</h1>
          <p className="text-muted-foreground">Nền tảng chia sẻ tài liệu học tập</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Chào mừng</CardTitle>
            <CardDescription>
              Đăng nhập hoặc tạo tài khoản để bắt đầu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Đăng nhập</TabsTrigger>
                <TabsTrigger value="signup">Đăng ký</TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mt-4 bg-destructive/10">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="signin" className="space-y-4 mt-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nhap@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Đăng nhập
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullname">Họ và tên</Label>
                    <Input
                      id="fullname"
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-signup">Email</Label>
                    <Input
                      id="email-signup"
                      type="email"
                      placeholder="nhap@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signup">Mật khẩu</Label>
                    <Input
                      id="password-signup"
                      type="password"
                      placeholder="Tối thiểu 6 ký tự"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Đăng ký
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link 
            to="/" 
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;