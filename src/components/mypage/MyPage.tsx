import {
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { X } from "lucide-react"
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

// UI Components
import { SidebarGroup } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Context and Constants
import { useAuth } from "@/contexts/AuthContext";
import { backUrl } from "@/constants";

// Types
import { User } from "@/types/user";
import { PetData } from "@/types/pet";

// Custom Components
import { KakaoLoginPopup } from "@/components/kakaoLogin/KakaoLoginPopup";
import { AddPetFormPopup } from "./petForm/AddPetFormPopup";

// Internal Components
import { ProfileSection } from './ProfileSection';
import { PetsSection } from './PetsSection';
import { DeletePetDialog } from './DeletePetDialog';

export function MyPage() {
    const navigate = useNavigate();

    // Authentication and State Management
    const { isLoggedIn, logout } = useAuth();
    const [userData, setUserData] = useState<User | null>(null);
    const [userPets, setUserPets] = useState<PetData[]>([]);
    const [loading, setLoading] = useState(true);
    const [points, setPoints] = useState<number>(0);

    // Modal and Interaction States
    const [isAddPetOpen, setIsAddPetOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [petToDelete, setPetToDelete] = useState<PetData | null>(null);

    // 사용자 포인트 조회하기
    const fetchUserPoints = async () => {
        try {
            const response = await axios.get(`${backUrl}/api/v1/payment/points`, {
                withCredentials: true,
            });
            setPoints(response.data);
            return response.data;
        } catch (error) {
            console.error("포인트 정보 가져오기 실패:", error);
            setPoints(0);
        }
    };

    useEffect(() => {
        const loadUserData = async () => {
            setLoading(true);
            if (isLoggedIn) {
                await fetchUserInfo();
                await fetchUserPets();
                await fetchUserPoints(); // 포인트 정보 가져오기 추가
            }
            setLoading(false);
        };
    
        loadUserData();
    }, [isLoggedIn]);

    // 사용자 정보 가져오기
    const fetchUserInfo = async () => {
        try {
            const response = await axios.get(`${backUrl}/api/v1/members/me`, {
                withCredentials: true,
            });
            setUserData(response.data);
        } catch (error) {
            console.error("유저 정보 가져오기 실패:", error);
            setUserData(null);
        }
    };

    // 사용자 펫 가져오기
    const fetchUserPets = async () => {
        try {
            const response = await axios.get(`${backUrl}/api/v1/mypets`, {
                withCredentials: true,
            });
            setUserPets(response.data.data || []);
        } catch (error) {
            console.error("반려동물 정보 가져오기 실패:", error);
            setUserPets([]);
        }
    };

    // 반려동물 삭제 함수
    const deletePet = async (petId: string | number) => {
        try {
            await axios.delete(`${backUrl}/api/v1/mypets/${petId}`, {
                withCredentials: true,
            });

            // 삭제 성공 시 목록 갱신
            await fetchUserPets();
            return true;
        } catch (error) {
            console.error("반려동물 삭제 실패:", error);
            return false;
        }
    };

    // 삭제 버튼 클릭 핸들러
    const handleDeleteClick = (pet: PetData) => {
        setPetToDelete(pet);
        setIsDeleteDialogOpen(true);
    };

    // 삭제 확인 핸들러
    const handleConfirmDelete = async () => {
        if (petToDelete?.id) {
            const success = await deletePet(petToDelete.id);
            if (!success) {
                alert("반려동물 삭제에 실패했습니다.");
            }
        }
        setIsDeleteDialogOpen(false);
        setPetToDelete(null);
    };



    // Data Loading Effect
    useEffect(() => {
        const loadUserData = async () => {
            setLoading(true);
            if (isLoggedIn) {
                await Promise.all([
                    fetchUserInfo(),
                    fetchUserPets(),
                    fetchUserPoints()
                ]);
            }
            setLoading(false);
        };

        loadUserData();
    }, [isLoggedIn]);

    // 반려동물 추가 성공 후 실행될 함수
    const handlePetAdded = () => {
        fetchUserPets();
    };

    const handleLogout = () => {
        logout();
    };

    const handlePayment = async () => {
        try {
            navigate('/checkout');
        } catch (error) {
            console.error("결제 페이지 이동 실패:", error);
            alert("결제 페이지로 이동할 수 없습니다.");
        }
    };

    // Render Loading State for Non-Logged In Users
    if (!isLoggedIn) {
        return (
            <div className="flex-1 overflow-y-auto bg-white md:h-[calc(100vh-120px)]">
                <SidebarGroup className="p-4">
                    <Card className="mb-4">
                        <CardContent className="p-6 flex flex-col items-center justify-center">
                            <h3 className="font-medium text-lg mb-2">로그인이 필요합니다</h3>
                            <p className="text-gray-500 text-sm mb-4">서비스를 이용하려면 로그인하세요.</p>
                            <KakaoLoginPopup />
                        </CardContent>
                    </Card>
                </SidebarGroup>
            </div>
        );
    }

    // Render Loading Indicator
    if (loading) {
        return (
            <div className="flex-1 overflow-y-auto bg-white md:h-[calc(100vh-120px)] flex items-center justify-center">
                <p>데이터를 불러오는 중...</p>
            </div>
        );
    }

    // Main Page Render
    return (
        <div className="flex-1 overflow-y-auto bg-white md:h-[calc(100vh-120px)]">
            {/* 프로필 섹션 */}
            <SidebarGroup className="p-4">
                <Card className="mb-4">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">내 프로필</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 rounded-full">
                                {userData?.avatar && (
                                    <AvatarImage src={userData.avatar} alt={userData.nickname || '사용자'} />
                                )}
                                <AvatarFallback>{userData?.nickname?.charAt(0) || '?'}</AvatarFallback>
                            </Avatar>
                            <div className="justify-start">
                                <h3 className="font-medium text-lg">{userData?.nickname || '사용자'}</h3>
                                <p className="text-gray-600 text-sm">내 포인트 : </p>
                                <div className="flex items-center justify-start">
                                <span className="text-xl font-bold text-green-700 ml-2">{points.toLocaleString()} P</span>
                                    <Button
                                        onClick={handlePayment}
                                        className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 scale-75">
                                        충전하기
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </SidebarGroup>

            <SidebarGroup className="p-4">
                <ProfileSection userData={userData} points={points} />
            </SidebarGroup>

            {/* 내 반려동물 섹션 */}
            <SidebarGroup className="p-4 pt-0">
                <PetsSection
                    userPets={userPets}
                    userData={userData}
                    onAddPetClick={() => setIsAddPetOpen(true)}
                    onDeletePet={handleDeleteClick}
                />
            </SidebarGroup>

            {/* 반려동물 추가 팝업 */}
            <AddPetFormPopup
                open={isAddPetOpen}
                onOpenChange={setIsAddPetOpen}
                onSuccess={fetchUserPets}
            />

            {/* 로그아웃 버튼 */}
            <SidebarGroup className="p-4">
                <Button className="w-full" variant="ghost" onClick={logout}>
                    로그아웃
                </Button>
            </SidebarGroup>

            {/* 저작권 정보 */}
            <div className="p-4 mt-auto text-center text-gray-500">
                <div>© 2025 Here Is Paw</div>
            </div>

            {/* 반려동물 삭제 확인 대화상자 */}
            <DeletePetDialog
                isOpen={isDeleteDialogOpen}
                petToDelete={petToDelete}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirmDelete={handleConfirmDelete}
            />
        </div>
    );
}