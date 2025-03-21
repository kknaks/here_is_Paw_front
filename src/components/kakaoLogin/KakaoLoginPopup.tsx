import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { backUrl, frontUrl, kakaoUrl } from "@/constants";
import { AdminLoginPopup } from "@/components/admin/AdminLoginPopup.tsx";
import { useState } from "react";
import IconKakaoLargeWide from "../icons/IconKakaoLargeWide";

export const KakaoLoginPopup = () => {
  const [isKakaoOpen, setIsKakaoOpen] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const handleKakaoLogin = () => {
    window.location.href = `${backUrl}${kakaoUrl}?redirectUrl=${frontUrl}`;
  };

  const handleAdminLoginClick = () => {
    setIsKakaoOpen(false);
    setShowAdminLogin(true);
  };

  return (
    <>
      <AlertDialog open={isKakaoOpen} onOpenChange={setIsKakaoOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 bg-primary hover:bg-primary/80"
          >
            <span className="text-xs text-white">로그인</span>
          </Button>
        </AlertDialogTrigger>

        <AlertDialogPortal>
          <AlertDialogOverlay className="bg-black/50" />
          <AlertDialogContent className="max-w-[400px] p-0 rounded-xl bg-white shadow-lg">
            <AlertDialogCancel asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50"
              >
                <X className="h-6 w-6 text-gray-500" />
              </Button>
            </AlertDialogCancel>

            <div className="p-6 text-center">
              <AlertDialogHeader>
                <AlertDialogTitle>환영합니다</AlertDialogTitle>
                <AlertDialogDescription>
                  카카오 계정으로 간편하게 로그인하세요
                </AlertDialogDescription>
              </AlertDialogHeader>

              <button
                onClick={handleKakaoLogin}
                className="w-full p-0
                         flex items-center justify-center
                         transition-opacity my-4 hover:opacity-90"
              >
                <IconKakaoLargeWide width={"100%"} height={"auto"} />
              </button>

              <p className="text-xs text-gray-500 text-center px-4">
                로그인 시 서비스 이용약관과 개인정보 처리방침에 동의하게 됩니다.
              </p>
              <div className="w-full mt-4 flex justify-end">
                <button
                  onClick={handleAdminLoginClick}
                  className="text-xs text-muted-foreground hover:text-primary hover:underline"
                >
                  관리자 로그인
                </button>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
      <AdminLoginPopup open={showAdminLogin} onOpenChange={setShowAdminLogin} />
    </>
  );
};
