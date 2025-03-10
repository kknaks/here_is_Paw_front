import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { backUrl } from "@/constants";
import { PetList } from "@/types/mypet.ts";
import { useMapLocation } from "@/contexts/MapLocationContext.tsx";
import { useRadius } from "@/contexts/RadiusContext.tsx";

// 검색 모드 타입
type SearchMode = "전체" | "반경";

// 검색 필터 타입
type SearchFilter = "전체" | "잃어버렸개" | "발견했개" | "My";

// 검색 카테고리 타입
type SearchCategory = "전체" | "지역" | "품종";

// Context에서 제공할 데이터 및 메서드 타입
// Context 인터페이스에 searchPets 추가
interface PetContext {
  // 데이터
  missingPets: PetList[];
  findingPets: PetList[];

  // 상태
  searchMode: SearchMode;
  activeFilter: SearchFilter;
  searchCategory: SearchCategory;
  isLoading: boolean;
  hasMore: boolean;

  // 메서드
  setSearchMode: (mode: SearchMode) => void;
  setActiveFilter: (filter: SearchFilter) => void;
  setSearchCategory: (category: SearchCategory) => void;
  loadMorePets: () => Promise<void>;
  refreshPets: () => Promise<void>;
  searchPets: (params: SearchParams) => Promise<void>; // 추가된 함수
}

// 검색 파라미터 타입 정의
interface SearchParams {
  query: string;
  category: SearchCategory;
  mode: SearchMode;
  filter: SearchFilter;
}

// Context 생성
const PetContext = createContext<PetContext | undefined>(undefined);

// Context Provider 컴포넌트
export const PetProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // 상태 관리
  const [missingPets, setMissingPets] = useState<PetList[]>([]);
  const [findingPets, setFindingPets] = useState<PetList[]>([]);

  const [searchMode, setSearchMode] = useState<SearchMode>("전체");
  const [activeFilter, setActiveFilter] = useState<SearchFilter>("전체");
  const [searchCategory, setSearchCategory] = useState<SearchCategory>("전체");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);

  const { userLocation } = useMapLocation();
  const { radius } = useRadius();

  // 검색 함수 추가
  const searchPets = async (params: SearchParams) => {
    setIsLoading(true);
    setPage(0);

    try {
      const { query, category, mode } = params;

      if (mode === "전체") {
        // 전체 모드 검색 - 향후 구현
        console.log("전체 모드 검색:", params);
        await loadNormalData();
      } else {
        // 반경 모드 검색
        console.log("반경 모드 검색:", params);
        await loadRadiusData(query, category);
      }
    } catch (error) {
      console.error("검색 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    if (activeFilter === "My") {
      setMissingPets([]);
      setFindingPets([]);
    } else {
      refreshPets();
    }
  }, [searchMode, activeFilter, userLocation, radius]);

  useEffect(() => {
    console.log("현재 검색 모드:", searchMode);
  }, [searchMode]);

  useEffect(() => {
    console.log("현재 활성화 탭 :", activeFilter);
    console.log("실종 펫 정보:", missingPets);
    console.log("발견 펫 정보:", findingPets);
  }, [activeFilter]);

  // 기존 refreshPets 함수 수정
  const refreshPets = async () => {
    setIsLoading(true);
    setPage(0);

    try {
      if (searchMode === "전체") {
        // 전체 모드: 일반 페이징 API 사용
        await loadNormalData();
      } else {
        // 반경 모드: 반경 검색 API 사용 (검색어 없이 기본 반경 검색)
        await loadRadiusData("", "");
      }
    } catch (error) {
      console.error("데이터 로드 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNormalData = async () => {
    try {
      console.log("loadNormalData - hasMore", hasMore);
      // 실종 동물 데이터 로드
      if (activeFilter === "전체" || activeFilter === "잃어버렸개") {
        const missingResponse = await axios.get(
          `${backUrl}/api/v1/missings?page=0&size=10`
        );
        const newMissingPets = missingResponse.data.data.content || [];
        setMissingPets(newMissingPets);
        setHasMore(!missingResponse.data.data.last); // false
      } else if (activeFilter === "발견했개") {
        // 필터가 '발견했개'일 때는 실종 동물 데이터를 비움
        setMissingPets([]);
      }

      // 발견 동물 데이터 로드
      if (activeFilter === "전체" || activeFilter === "발견했개") {
        const findingResponse = await axios.get(
          `${backUrl}/api/v1/finding?page=0&size=10`,
          {
            withCredentials: true,
          }
        );
        const newFindingPets = findingResponse.data.data.content || [];
        setFindingPets(newFindingPets);
        setHasMore(!findingResponse.data.data.last);
      } else if (activeFilter === "잃어버렸개") {
        // 필터가 '잃어버렸개'일 때는 발견 동물 데이터를 비움
        setFindingPets([]);
      }
    } catch (error) {
      console.error("일반 데이터 로드 오류:", error);
      throw error;
    }
  };

  const loadRadiusData = async (keyword = "", category = "") => {
    try {
      if (!userLocation) {
        console.warn("반경 검색을 위한 위치 정보가 없습니다.");
        return;
      }

      const { _lat: lat, _lng: lng } = userLocation;

      // 카테고리 값을 API 요청에 맞게 변환 (없거나 '전체'인 경우 빈 문자열로)
      const apiCategory = category === "전체" ? "" : category;

      // hasMore 설정 - 반경 검색에서는 페이징이 없으므로 false로 설정
      setHasMore(false);

      // 실종 동물 반경 검색
      if (activeFilter === "전체" || activeFilter === "잃어버렸개") {
        const missingRadiusResponse = await axios.get(
          `${backUrl}/api/v1/missings/radius`,
          {
            params: {
              lat,
              lng,
              radius,
              keyword,
              category: apiCategory,
            },
          }
        );
        const radiusMissingPets = missingRadiusResponse.data.data || [];
        setMissingPets(radiusMissingPets);
        console.log("radiusMissingPets:", radiusMissingPets);
      } else {
        setMissingPets([]);
      }

      // 발견 동물 반경 검색
      if (activeFilter === "전체" || activeFilter === "발견했개") {
        const findingRadiusResponse = await axios.get(
          `${backUrl}/api/v1/finding/radius`,
          {
            params: {
              lat,
              lng,
              radius,
              keyword,
              category: apiCategory,
            },
            withCredentials: true,
          }
        );
        const radiusFindingPets = findingRadiusResponse.data.data || [];
        setFindingPets(radiusFindingPets);
        console.log("radiusFindingPets:", radiusFindingPets);
      } else {
        setFindingPets([]);
      }
    } catch (error) {
      console.error("반경 데이터 로드 오류:", error);
      throw error;
    }
  };

  // 추가 데이터 로드
  const loadMorePets = async () => {
    console.log("loadMorePets - hasMore", hasMore);
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const nextPage = page + 1;

    try {
      if (searchMode === "전체") {
        // 전체 모드에서는 페이징을 통해 더 많은 데이터 로드
        let response;

        if (activeFilter === "잃어버렸개" || activeFilter === "전체") {
          response = await axios.get(
            `${backUrl}/api/v1/missings?page=${nextPage}&size=10`
          );

          const newPets = response.data.data.content || [];
          setMissingPets((prev) => [...prev, ...newPets]);
          setHasMore(!response.data.data.last);
          console.log("///", response.data.data.last);
        }

        if (activeFilter === "발견했개" || activeFilter === "전체") {
          response = await axios.get(
            `${backUrl}/api/v1/finding?page=${nextPage}&size=10`
          );

          const newPets = response.data.data.content || [];
          setFindingPets((prev) => [...prev, ...newPets]);
          setHasMore(!response.data.data.last);
        }

        setPage(nextPage);
      }
      // 반경 모드에서는 추가 로드가 없음 (전체 결과를 한 번에 가져옴)
    } catch (error) {
      console.error("추가 데이터 로드 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Context 값 제공
  // Context 값 제공 - value 객체에 searchPets 추가
  const value: PetContext = {
    missingPets,
    findingPets,
    searchMode,
    activeFilter,
    searchCategory,
    isLoading,
    hasMore,
    setSearchMode,
    setActiveFilter,
    setSearchCategory,
    loadMorePets,
    refreshPets,
    searchPets, // 추가된 함수
  };

  return <PetContext.Provider value={value}>{children}</PetContext.Provider>;
};

// Context 훅
export const usePetContext = () => {
  const context = useContext(PetContext);
  if (context === undefined) {
    throw new Error("usePetContext must be used within a PetProvider");
  }
  return context;
};
