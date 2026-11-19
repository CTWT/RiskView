// src/components/CommonContainerHeader.tsx
import "../components.css";

/*
 * 생성자 : 문원주
 * 생성일 : 25.08.13
 * 파일명 : CommonContainerHeader.tsx
 * 수정자 : 박윤성
 * 수정일 : 25.09.27
 * 설명 : 공용 컨테이너에 들어갈 헤더 부분에 관한 tsx 파일입니다
 */

interface CommonContainerHeaderProps {
    subtitle: string;
    title: string;
    description: string;
}

const CommonContainerHeader = ({
    subtitle,
    title,
    description,
}: CommonContainerHeaderProps) => {
    return (
        <div className="common-container-header">
            <h2 className="common-container-header-subtitle">{subtitle}</h2>
            <h1 className="common-container-header-title">{title}</h1>
            <p className="common-container-header-description">{description}</p>
        </div>
    );
};

export default CommonContainerHeader;
