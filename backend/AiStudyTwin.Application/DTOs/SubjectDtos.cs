using AiStudyTwin.Domain.Enums;

namespace AiStudyTwin.Application.DTOs;

public record SubjectDto(
    Guid Id,
    string NameUz,
    string NameEn,
    string NameRu,
    string Code,
    string Description,
    string Icon,
    string GradientColor,
    int OrderIndex,
    int TotalTopicsCount,
    int TotalTestsCount
);

public record TopicDto(
    Guid Id,
    Guid SubjectId,
    string TitleUz,
    string TitleEn,
    string TitleRu,
    string Description,
    DifficultyLevel Difficulty,
    int EstimatedMinutes,
    int OrderIndex
);
