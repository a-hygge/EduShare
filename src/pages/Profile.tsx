import { useAuth } from "@/hooks/useAuth-new";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Layout/Header";
import { User, Mail, Shield, ArrowLeft, FileText, Download } from "lucide-react";
import { documentsAPI } from "@/lib/api";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalDownloads: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      console.log('[Profile Stats] Fetching stats for user:', user);
      console.log('[Profile Stats] Token:', token ? 'exists' : 'missing');
      
      if (user?.role === 'teacher') {
        // Get teacher stats from API
        let totalDocuments = 0;
        let totalDownloads = 0;
        
        try {
          const url = `${API_URL}/stats/teacher/${user.id}`;
          console.log('[Profile Stats] Fetching from:', url);
          
          const statsResponse = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('[Profile Stats] Response:', statsResponse.data);
          totalDocuments = statsResponse.data?.totalDocuments || 0;
          totalDownloads = statsResponse.data?.totalDownloads || 0;
        } catch (err: any) {
          console.error('[Profile Stats] API Error:', err.response?.data || err.message);
        }
        
        console.log('[Profile Stats] Setting teacher stats:', { totalDocuments, totalDownloads });
        setStats({
          totalDocuments,
          totalDownloads
        });
      } else if (user?.role === 'student') {
        // Get student's download history
        let totalDownloads = 0;
        try {
          const url = `${API_URL}/stats/student/${user.id}`;
          console.log('[Profile Stats] Fetching from:', url);
          
          const downloadsResponse = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('[Profile Stats] Response:', downloadsResponse.data);
          totalDownloads = downloadsResponse.data?.totalDownloads || 0;
        } catch (err: any) {
          console.error('[Profile Stats] API Error:', err.response?.data || err.message);
        }
        
        console.log('[Profile Stats] Setting student stats:', { totalDownloads });
        setStats({
          totalDocuments: 0,
          totalDownloads
        });
      }
    } catch (error) {
      console.error('[Profile Stats] Error fetching stats:', error);
      // Set default values on error
      setStats({
        totalDocuments: 0,
        totalDownloads: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header onMenuToggle={() => {}} />
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center">Vui lòng đăng nhập để xem hồ sơ</p>
              <div className="flex justify-center mt-4">
                <Button onClick={() => navigate('/auth')}>Đăng nhập</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      student: { label: 'Sinh viên', variant: 'default' as const },
      teacher: { label: 'Giảng viên', variant: 'secondary' as const },
      admin: { label: 'Quản trị viên', variant: 'destructive' as const }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.student;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={() => {}} />
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-6 w-6" />
              Hồ sơ cá nhân
            </CardTitle>
            <CardDescription>
              Thông tin tài khoản của bạn
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  Họ và tên
                </Label>
                <Input 
                  value={user.full_name || 'Chưa cập nhật'} 
                  disabled 
                  className="bg-muted"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input 
                  value={user.email} 
                  disabled 
                  className="bg-muted"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4" />
                  Vai trò
                </Label>
                <div className="flex items-center gap-2">
                  {getRoleBadge(user.role)}
                </div>
              </div>

              <div className="pt-4 border-t">
                <Label className="text-muted-foreground">ID tài khoản</Label>
                <p className="text-sm font-mono mt-1 text-muted-foreground">{user.id}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Quay lại trang chủ
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="flex-1"
              >
                Đăng xuất
              </Button>
            </div>
          </CardContent>
        </Card>

        {user.role === 'teacher' && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Thống kê giảng viên</CardTitle>
              <CardDescription>Số liệu về tài liệu của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                  <FileText className="h-8 w-8 mb-2 text-primary" />
                  <p className="text-2xl font-bold">{loading ? '...' : stats.totalDocuments}</p>
                  <p className="text-sm text-muted-foreground">Tài liệu đã upload</p>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                  <Download className="h-8 w-8 mb-2 text-green-600" />
                  <p className="text-2xl font-bold">{loading ? '...' : stats.totalDownloads}</p>
                  <p className="text-sm text-muted-foreground">Lượt tải xuống</p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/upload')}
                className="mt-4 w-full"
              >
                Upload tài liệu mới
              </Button>
            </CardContent>
          </Card>
        )}

        {user.role === 'student' && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Thống kê sinh viên</CardTitle>
              <CardDescription>Hoạt động của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                <Download className="h-8 w-8 mb-2 text-blue-600" />
                <p className="text-2xl font-bold">{loading ? '...' : stats.totalDownloads}</p>
                <p className="text-sm text-muted-foreground">Tài liệu đã tải xuống</p>
              </div>
              <Button 
                onClick={() => navigate('/')}
                className="mt-4 w-full"
                variant="outline"
              >
                Xem tài liệu
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
