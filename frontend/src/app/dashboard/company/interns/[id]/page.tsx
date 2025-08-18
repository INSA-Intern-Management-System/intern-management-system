"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/app/layout/dashboard-layout";
import {
  User,
  MessageSquare,
  Calendar,
  Star,
  MapPin,
  GraduationCap,
  Phone,
  Mail,
  Github,
  Linkedin,
  FileText,
  ArrowLeft,
  Edit,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";

// Same user data as in the main page
const users = [
  {
    id: 1,
    first_name: "Sophie",
    last_name: "Laurent",
    email: "sophie.laurent@email.com",
    gender: "female",
    phone_number: "+33 1 23 45 67 89",
    institution: "INSA Rennes",
    field_of_study: "Computer Science",
    bio: "Passionate about UI/UX design and user experience research. Currently working on mobile app redesign project. I have experience in user interviews, wireframing, prototyping, and usability testing. My goal is to create intuitive and accessible digital experiences.",
    notify_email: true,
    visibility: "public",
    address: "Rennes, France",
    duration: "6 months",
    linkedin_url: "https://linkedin.com/in/sophie-laurent",
    github_url: "https://github.com/sophie-laurent",
    cv_url: "/cv/sophie-laurent.pdf",
    profile_pic_url: "/profiles/sophie.jpg",
    role: "intern",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
    position: "UI/UX Designer",
    mentor: "Sarah Wilson",
    startDate: "2024-01-15",
    endDate: "2024-06-15",
    progress: 75,
    project: "Mobile App Redesign",
    rating: 4.8,
    status: "active",
    skills: ["Figma", "Adobe XD", "HTML/CSS", "User Research", "Prototyping"],
    reportsSubmitted: 8,
    totalReports: 10,
  },
  {
    id: 2,
    first_name: "Pierre",
    last_name: "Martin",
    email: "pierre.martin@email.com",
    gender: "male",
    phone_number: "+33 5 61 23 45 67",
    institution: "INSA Toulouse",
    field_of_study: "Data Science",
    bio: "Data enthusiast with strong analytical skills. Experienced in Python, SQL, and data visualization tools. Currently working on customer analytics dashboard to help improve business decision-making processes.",
    notify_email: true,
    visibility: "public",
    address: "Toulouse, France",
    duration: "5 months",
    linkedin_url: "https://linkedin.com/in/pierre-martin",
    github_url: "https://github.com/pierre-martin",
    cv_url: "/cv/pierre-martin.pdf",
    profile_pic_url: "/profiles/pierre.jpg",
    role: "intern",
    created_at: "2024-01-08T00:00:00Z",
    updated_at: "2024-01-08T00:00:00Z",
    position: "Data Analyst",
    mentor: "Tom Davis",
    startDate: "2024-01-08",
    endDate: "2024-06-08",
    progress: 60,
    project: "Customer Analytics Dashboard",
    rating: 4.6,
    status: "active",
    skills: ["Python", "SQL", "Tableau", "Machine Learning", "Statistics"],
    reportsSubmitted: 6,
    totalReports: 10,
  },
  {
    id: 3,
    first_name: "Marie",
    last_name: "Dubois",
    email: "marie.dubois@email.com",
    gender: "female",
    phone_number: "+33 4 72 11 22 33",
    institution: "INSA Lyon",
    field_of_study: "Software Engineering",
    bio: "Full-stack developer with expertise in modern web technologies. Passionate about creating scalable applications.",
    notify_email: true,
    visibility: "public",
    address: "Lyon, France",
    duration: "5 months",
    linkedin_url: "https://linkedin.com/in/marie-dubois",
    github_url: "https://github.com/marie-dubois",
    cv_url: "/cv/marie-dubois.pdf",
    profile_pic_url: "/profiles/marie.jpg",
    role: "intern",
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z",
    position: "Software Developer",
    mentor: "Alex Johnson",
    startDate: "2024-02-01",
    endDate: "2024-07-01",
    progress: 45,
    project: "E-commerce Platform",
    rating: 4.9,
    status: "active",
    skills: ["React", "Node.js", "MongoDB"],
    reportsSubmitted: 4,
    totalReports: 8,
  },
  {
    id: 4,
    first_name: "Lucas",
    last_name: "Bernard",
    email: "lucas.bernard@email.com",
    gender: "male",
    phone_number: "+33 4 72 44 55 66",
    institution: "INSA Lyon",
    field_of_study: "Software Engineering",
    bio: "Backend developer with strong experience in Java and Spring framework. Completed successful internship.",
    notify_email: false,
    visibility: "public",
    address: "Lyon, France",
    duration: "5 months",
    linkedin_url: "https://linkedin.com/in/lucas-bernard",
    github_url: "https://github.com/lucas-bernard",
    cv_url: "/cv/lucas-bernard.pdf",
    profile_pic_url: "/profiles/lucas.jpg",
    role: "intern",
    created_at: "2023-09-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z",
    position: "Software Developer",
    mentor: "Sarah Wilson",
    startDate: "2023-09-01",
    endDate: "2024-02-01",
    progress: 100,
    project: "Internal Tools Development",
    rating: 4.7,
    status: "completed",
    skills: ["Java", "Spring", "MySQL"],
    reportsSubmitted: 20,
    totalReports: 20,
  },
  {
    id: 5,
    first_name: "Emma",
    last_name: "Rousseau",
    email: "emma.rousseau@email.com",
    gender: "female",
    phone_number: "+33 2 40 11 22 33",
    institution: "INSA Rennes",
    field_of_study: "Marketing",
    bio: "Digital marketing specialist with focus on social media and content strategy.",
    notify_email: true,
    visibility: "public",
    address: "Rennes, France",
    duration: "4 months",
    linkedin_url: "https://linkedin.com/in/emma-rousseau",
    github_url: null,
    cv_url: "/cv/emma-rousseau.pdf",
    profile_pic_url: "/profiles/emma.jpg",
    role: "intern",
    created_at: "2024-03-01T00:00:00Z",
    updated_at: "2024-03-01T00:00:00Z",
    position: "Marketing Intern",
    mentor: "Lisa Chen",
    startDate: "2024-03-01",
    endDate: "2024-07-01",
    progress: 30,
    project: "Social Media Campaign",
    rating: 4.5,
    status: "on-leave",
    skills: ["Social Media", "Content Creation", "Analytics"],
    reportsSubmitted: 2,
    totalReports: 8,
  },
  {
    id: 6,
    first_name: "Thomas",
    last_name: "Leroy",
    email: "thomas.leroy@email.com",
    gender: "male",
    phone_number: "+33 5 61 77 88 99",
    institution: "INSA Toulouse",
    field_of_study: "Mechanical Engineering",
    bio: "Mechanical engineer with interest in automation and robotics.",
    notify_email: true,
    visibility: "private",
    address: "Toulouse, France",
    duration: "6 months",
    linkedin_url: "https://linkedin.com/in/thomas-leroy",
    github_url: "https://github.com/thomas-leroy",
    cv_url: "/cv/thomas-leroy.pdf",
    profile_pic_url: "/profiles/thomas.jpg",
    role: "intern",
    created_at: "2024-01-20T00:00:00Z",
    updated_at: "2024-01-20T00:00:00Z",
    position: "Engineering Intern",
    mentor: "David Kim",
    startDate: "2024-01-20",
    endDate: "2024-07-20",
    progress: 55,
    project: "Automation System",
    rating: 4.4,
    status: "on-leave",
    skills: ["CAD", "Python", "Automation"],
    reportsSubmitted: 5,
    totalReports: 12,
  },
  // Add other users here...
];

export default function InternProfilePage() {
  const router = useRouter();
  const params = useParams();
  const internId = Number.parseInt(params.id as string);

  const intern = users.find((user) => user.id === internId);

  if (!intern) {
    return (
      <DashboardLayout requiredRole="company">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Intern not found
            </h3>
            <Button onClick={() => router.push("/dashboard/company/interns")}>
              Back to Interns
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500 text-white hover:bg-green-600">
            Active
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-500 text-white hover:bg-blue-600">
            Completed
          </Badge>
        );
      case "on-leave":
        return (
          <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">
            On Leave
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleMessageUser = () => {
    router.push("/dashboard/company/messages");
  };

  return (
    <DashboardLayout requiredRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/company/interns")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Interns
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {intern.first_name} {intern.last_name}
              </h1>
              <p className="text-gray-600">
                {intern.position} • {intern.institution}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-12 w-12 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {intern.first_name} {intern.last_name}
                </h2>
                <p className="text-gray-600 mb-3">{intern.position}</p>
                {getStatusBadge(intern.status)}
                <div className="flex items-center justify-center mt-3">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">
                    {intern.rating} Rating
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{intern.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{intern.phone_number}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{intern.address}</span>
                </div>
                {intern.linkedin_url && (
                  <div className="flex items-center space-x-3">
                    <Linkedin className="h-4 w-4 text-gray-400" />
                    <a
                      href={intern.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                {intern.github_url && (
                  <div className="flex items-center space-x-3">
                    <Github className="h-4 w-4 text-gray-400" />
                    <a
                      href={intern.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      GitHub Profile
                    </a>
                  </div>
                )}
                {intern.cv_url && (
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <a
                      href={intern.cv_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Download CV
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={handleMessageUser}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{intern.bio}</p>
              </CardContent>
            </Card>

            {/* Internship Details */}
            <Card>
              <CardHeader>
                <CardTitle>Internship Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Position
                      </label>
                      <p className="text-gray-900">{intern.position}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Project
                      </label>
                      <p className="text-gray-900">{intern.project}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Mentor
                      </label>
                      <p className="text-gray-900">{intern.mentor}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Duration
                      </label>
                      <p className="text-gray-900">{intern.duration}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Start Date
                      </label>
                      <p className="text-gray-900">
                        {new Date(intern.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        End Date
                      </label>
                      <p className="text-gray-900">
                        {new Date(intern.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Reports Submitted
                      </label>
                      <p className="text-gray-900">
                        {intern.reportsSubmitted} / {intern.totalReports}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Progress
                      </label>
                      <div className="flex items-center space-x-3 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${intern.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {intern.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Institution
                    </label>
                    <p className="text-gray-900 flex items-center">
                      <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                      {intern.institution}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Field of Study
                    </label>
                    <p className="text-gray-900">{intern.field_of_study}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Skills & Technologies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {intern.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
