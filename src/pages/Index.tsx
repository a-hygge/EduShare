import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  FileText,
  Download,
  Users,
  BookOpen,
  Upload,
  Eye,
  Trash2,
} from "lucide-react";
import { documentsAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth-new";
import type { Document } from "@/types/api";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Index = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [systemStats, setSystemStats] = useState({
    totalDocuments: 0,
    totalUsers: 0,
    totalTeachers: 0,
    totalDownloads: 0
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchSystemStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/stats/system`);
      setSystemStats(response.data);
    } catch (error) {
      console.error('Stats error:', error);
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await documentsAPI.getAll(params);
      setDocuments(response.data?.documents || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách tài liệu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, toast]);

  useEffect(() => {
    void fetchDocuments();
    void fetchSystemStats();
  }, [fetchDocuments, fetchSystemStats]);

  const handleDelete = async (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user || user.role !== 'teacher' || doc.uploaded_by !== user.id) {
      toast({
        title: "Không có quyền",
        description: "Chỉ giáo viên có thể xóa tài liệu của mình",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa tài liệu "${doc.title}"?`)) {
      return;
    }

    try {
      await documentsAPI.delete(doc.id);
      toast({
        title: "Thành công",
        description: "Đã xóa tài liệu",
      });
      fetchDocuments();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa tài liệu",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      if (!user) {
        toast({
          title: "Yêu cầu đăng nhập",
          description: "Vui lòng đăng nhập để tải tài liệu",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // Track download
      await documentsAPI.download(doc.id);
      
      toast({
        title: "Thành công",
        description: `Đang tải xuống: ${doc.title}`,
      });
      
      // Download file from server
      const fileUrl = `http://localhost:3000${doc.file_path}`;
      window.location.href = fileUrl;
      
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải tài liệu",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchDocuments();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={() => {}} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Chia Sẻ Tài Liệu Học Tập
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sinh viên tải không giới hạn
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm tài liệu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Tìm kiếm</Button>
            </div>
          </form>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Tài liệu</CardDescription>
              <CardTitle className="text-3xl">{systemStats.totalDocuments}</CardTitle>
            </CardHeader>
            <CardContent>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Người dùng</CardDescription>
              <CardTitle className="text-3xl">{systemStats.totalUsers}</CardTitle>
            </CardHeader>
            <CardContent>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Giáo viên</CardDescription>
              <CardTitle className="text-3xl">{systemStats.totalTeachers}</CardTitle>
            </CardHeader>
            <CardContent>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Lượt tải</CardDescription>
              <CardTitle className="text-3xl">{systemStats.totalDownloads}</CardTitle>
            </CardHeader>
            <CardContent>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>

        {/* Upload Button for Teachers */}
        {user?.role === 'teacher' && (
          <div className="mb-6">
            <Button onClick={() => navigate('/upload')} size="lg">
              <Upload className="h-4 w-4 mr-2" />
              Upload Tài Liệu
            </Button>
          </div>
        )}

        {/* Documents List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Danh sách tài liệu</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Đang tải...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">Chưa có tài liệu nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{doc.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {doc.description || 'Không có mô tả'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Giáo viên: {doc.uploader_name || 'N/A'}</span>
                      <span className="uppercase">{doc.file_type?.split('/')[1]?.split('.').pop()?.toUpperCase() || doc.file_path?.split('.').pop()?.toUpperCase() || 'N/A'}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => navigate(`/document/${doc.id}`)}
                        className="flex-1"
                        variant="outline"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Xem trước
                      </Button>
                      <Button 
                        onClick={() => handleDownload(doc)} 
                        className="flex-1"
                        variant={user ? "default" : "outline"}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Tải
                      </Button>
                      {user && user.role === 'teacher' && doc.uploaded_by === user.id && (
                        <Button 
                          onClick={(e) => handleDelete(doc, e)}
                          variant="destructive"
                          size="icon"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
