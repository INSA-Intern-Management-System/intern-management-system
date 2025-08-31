"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  MessageSquare,
  Phone,
  Mail,
  Star,
  Github,
  Linkedin,
  FileText,
  ArrowLeft,
  MapPin,
  GraduationCap,
  Calendar,
  TrendingUp,
  FileCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Intern {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string | null;
  gender: string;
  fieldOfStudy: string;
  institution: string;
  bio: string | null;
  duration: string | null;
  linkedInUrl: string | null;
  githubUrl: string | null;
  cvUrl: string | null;
  profilePicUrl: string | null;
  userStatus: string;
  createdAt: string;
  updatedAt: string;

}

interface AdditionalData {
  progress: number;
  reportsSubmitted: number;
  totalReports: number;
  rating: number;
}

interface InternProfileClientProps {
  initialIntern: Intern | null;
  additionalData: AdditionalData | null;
  internId: number;
}

export default function InternProfileClient({
  initialIntern,
  additionalData,
  internId,
}: InternProfileClientProps) {
  const router = useRouter();
  const intern = initialIntern;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-green-500 text-white hover:bg-green-600">
            Active
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-blue-500 text-white hover:bg-blue-600">
            Completed
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">
            Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleMessageUser = () => {
    router.push("/dashboard/company/messages");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateEndDate = (startDate: string, duration: string | null) => {
    if (!duration) return "Not specified";
    
    const monthsMatch = duration.match(/(\d+)\s*month/i);
    if (!monthsMatch) return "Not specified";
    
    const months = parseInt(monthsMatch[1]);
    const start = new Date(startDate);
    const endDate = new Date(start);
    endDate.setMonth(start.getMonth() + months);
    
    return formatDate(endDate.toISOString());
  };

  const calculateWeeksCompleted = (startDate: string, duration: string | null) => {
    if (!duration) return 0;
    
    const monthsMatch = duration.match(/(\d+)\s*month/i);
    if (!monthsMatch) return 0;
    
    const totalMonths = parseInt(monthsMatch[1]);
    const start = new Date(startDate);
    const currentDate = new Date();
    
    const elapsedMonths = (currentDate.getFullYear() - start.getFullYear()) * 12 +
                         (currentDate.getMonth() - start.getMonth());
    
    const progress = Math.min(100, Math.max(0, (elapsedMonths / totalMonths) * 100));
    const totalWeeks = totalMonths * 4; // Approximate weeks
    const completedWeeks = Math.floor((progress / 100) * totalWeeks);
    
    return completedWeeks;
  };

  if (!intern) {
    return (
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
    );
  }

  const progress = additionalData?.progress || 0;
  const reportsSubmitted = additionalData?.reportsSubmitted || 0;
  const totalReports = additionalData?.totalReports || 12;
  const rating = additionalData?.rating || 0;
  const weeksCompleted = calculateWeeksCompleted(intern.createdAt, intern.duration);

  return (
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
              {intern.firstName} {intern.lastName}
            </h1>
            <p className="text-gray-600">
              {intern.fieldOfStudy} • {intern.institution}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Overview */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-12 w-12 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {intern.firstName} {intern.lastName}
              </h2>
              <p className="text-gray-600 mb-3">{intern.fieldOfStudy}</p>
              {getStatusBadge(intern.userStatus)}
              <div className="flex items-center justify-center mt-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-1">
                  {rating.toFixed(1)}
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
                <span className="text-sm">{intern.phoneNumber}</span>
              </div>
              {intern.address && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{intern.address}</span>
                </div>
              )}
              {intern.linkedInUrl && (
                <div className="flex items-center space-x-3">
                  <Linkedin className="h-4 w-4 text-gray-400" />
                  <a
                    href={intern.linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    LinkedIn Profile
                  </a>
                </div>
              )}
              {intern.githubUrl && (
                <div className="flex items-center space-x-3">
                  <Github className="h-4 w-4 text-gray-400" />
                  <a
                    href={intern.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    GitHub Profile
                  </a>
                </div>
              )}
              {intern.cvUrl && (
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <a
                    href={intern.cvUrl}
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
              <Button variant="outline" className="w-full">
                <FileCheck className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {intern.bio || "No bio information available."}
              </p>
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Internship Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-blue-600 rounded-full"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{Math.round(progress)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <FileCheck className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Reports Submitted</p>
                      <p className="text-lg font-semibold">
                        {reportsSubmitted} / {totalReports}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Weeks Completed</p>
                      <p className="text-lg font-semibold">{weeksCompleted} weeks</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Average Rating</p>
                      <p className="text-lg font-semibold">{rating.toFixed(1)} / 5</p>
                    </div>
                  </div>
                </div>
              </div>
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
                    <label className="text-sm font-medium text-gray-600">Field of Study</label>
                    <p className="text-gray-900">{intern.fieldOfStudy}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Duration</label>
                    <p className="text-gray-900">{intern.duration || "Not specified"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Start Date</label>
                    <p className="text-gray-900">{formatDate(intern.createdAt)}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {intern.duration && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Estimated End Date</label>
                      <p className="text-gray-900">{calculateEndDate(intern.createdAt, intern.duration)}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div className="mt-1">{getStatusBadge(intern.userStatus)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Updated</label>
                    <p className="text-gray-900">{formatDate(intern.updatedAt)}</p>
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
                <div className="flex items-center space-x-3">
                  <GraduationCap className="h-5 w-5 text-gray-400" />
                  <div>
                    <label className="text-sm font-medium text-gray-600">Institution</label>
                    <p className="text-gray-900">{intern.institution}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Field of Study</label>
                  <p className="text-gray-900">{intern.fieldOfStudy}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills & Technologies */}
          <Card>
            <CardHeader>
              <CardTitle>Skills & Technologies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {intern.fieldOfStudy.includes("Computer Science") && (
                  <>
                    <Badge variant="outline" className="text-sm">Java</Badge>
                    <Badge variant="outline" className="text-sm">Python</Badge>
                    <Badge variant="outline" className="text-sm">SQL</Badge>
                    <Badge variant="outline" className="text-sm">Algorithms</Badge>
                    <Badge variant="outline" className="text-sm">Data Structures</Badge>
                    <Badge variant="outline" className="text-sm">OOP</Badge>
                  </>
                )}
                {intern.fieldOfStudy.includes("Software Engineering") && (
                  <>
                    <Badge variant="outline" className="text-sm">React</Badge>
                    <Badge variant="outline" className="text-sm">Node.js</Badge>
                    <Badge variant="outline" className="text-sm">Git</Badge>
                    <Badge variant="outline" className="text-sm">Agile</Badge>
                    <Badge variant="outline" className="text-sm">TypeScript</Badge>
                    <Badge variant="outline" className="text-sm">API Design</Badge>
                  </>
                )}
                {intern.fieldOfStudy.includes("Data Science") && (
                  <>
                    <Badge variant="outline" className="text-sm">Python</Badge>
                    <Badge variant="outline" className="text-sm">R</Badge>
                    <Badge variant="outline" className="text-sm">Machine Learning</Badge>
                    <Badge variant="outline" className="text-sm">Statistics</Badge>
                    <Badge variant="outline" className="text-sm">Data Visualization</Badge>
                    <Badge variant="outline" className="text-sm">Pandas</Badge>
                  </>
                )}
                <Badge variant="outline" className="text-sm">Problem Solving</Badge>
                <Badge variant="outline" className="text-sm">Teamwork</Badge>
                <Badge variant="outline" className="text-sm">Communication</Badge>
                <Badge variant="outline" className="text-sm">Time Management</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}