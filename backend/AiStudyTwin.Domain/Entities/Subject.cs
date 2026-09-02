using AiStudyTwin.Domain.Common;

namespace AiStudyTwin.Domain.Entities;

public class Subject : BaseEntity
{
    public string NameUz { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string NameRu { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string GradientColor { get; set; } = "from-indigo-500 to-purple-600";
    public int OrderIndex { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    public ICollection<Topic> Topics { get; set; } = new List<Topic>();
    public ICollection<Test> Tests { get; set; } = new List<Test>();
    public ICollection<Progress> ProgressList { get; set; } = new List<Progress>();
}
