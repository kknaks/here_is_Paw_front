import { Sidebar } from "@/components/ui/sidebar";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarMainContent } from "./sidebar/SidebarContent";
import { useState, useEffect } from "react";
import { Pet } from "@/types/pet";
import { MyPage } from "@/components/mypage/MyPage.tsx";
import { MissingList } from "./missingPost/missingList";
import { backUrl } from "@/constants";

interface AppSidebarProps {
  lostPets: Pet[];
  findPets: Pet[];
}

export function AppSidebar({ lostPets }: AppSidebarProps) {
  const [activeFilter, setActiveFilter] = useState<string>("전체");

  // 상태 변경을 감지하는 useEffect 추가
  useEffect(() => {
    console.log("activeFilter 상태 변경됨:", activeFilter);
  }, [activeFilter]);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  return (
    <Sidebar className="max-lg:w-[18rem]">
      {/* 헤더 영역 */}
      <SidebarHeader
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      {/* 컨텐츠 영역 */}
      {activeFilter === "My" ? (
        <MyPage />
      ) : activeFilter === "잃어버렸개" ? (
        <MissingList activeFilter={"잃어버렸개"} backUrl={`${backUrl}`} />
      ) : (
        <SidebarMainContent lostPets={lostPets} />
      )}
    </Sidebar>
  );
}
