import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, ArrowLeft } from "lucide-react";
import { documentsAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth-new";

const UploadPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user is teacher
  if (!user || user.role !== 'teacher') {
    return (
      <div className="min-h-screen bg-background">
        <Header onMenuToggle={() => {}} />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Chỉ giáo viên mới có thể upload tài liệu</h1>
          <Button onClick={() => navigate('/')}>Quay lại trang chủ</Button>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tiêu đề",
        variant: "destructive",
      });
      return;
    }

    if (!file) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);

      // Step 1: Upload file to server
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const uploadResponse = await fetch('http://localhost:3000/api/uploads/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload file thất bại');
      }

      const uploadData = await uploadResponse.json();
      
      // Step 2: Create document record
      await documentsAPI.create({
        title: title.trim(),
        description: description.trim() || null,
        file_path: uploadData.file.path,
        file_type: uploadData.file.mimetype,
      });

      toast({
        title: "Thành công",
        description: "Tải lên tài liệu thành công",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setFile(null);
      
      // Redirect to home
      setTimeout(() => navigate('/'), 1500);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Lỗi",
        description: error.response?.data?.error || "Không thể tải lên tài liệu",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={() => {}} />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Upload Tài Liệu</CardTitle>
            <CardDescription>
              Chia sẻ tài liệu học tập với sinh viên
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="VD: Bài giảng Tuần 1 - Giới thiệu HTML"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả ngắn gọn về tài liệu..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">File tài liệu *</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar,.xls,.xlsx,.csv,.mp4,.avi,.mov,.wmv,.flv,.mkv,.mp3,.wav,.aac,.flac,.ogg,.wma"
                  required
                />
                {file && (
                  <p className="text-sm text-muted-foreground">
                    Đã chọn: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Hỗ trợ: PDF, DOC, DOCX, PPT, PPTX, TXT, ZIP, RAR, XLS, XLSX, CSV, MP4, AVI, MOV, WMV, FLV, MKV, MP3, WAV, AAC, FLAC, OGG, WMA (tối đa 100MB)
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? (
                  <>Đang tải lên...</>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Tài Liệu
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UploadPage;
