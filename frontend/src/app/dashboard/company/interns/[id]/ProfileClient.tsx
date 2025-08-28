"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

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
  supervisor?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  projectManager?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

interface InternProfileClientProps {
  initialIntern: Intern | null;
  internId: number;
}

export default function InternProfileClient({
  initialIntern,
  internId,
}: InternProfileClientProps) {
  const router = useRouter();
  const [intern, setIntern] = useState<Intern | null>(initialIntern);
  const [isLoading, setIsLoading] = useState(!initialIntern);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // If no initial data was provided, fetch it
    if (!initialIntern) {
      fetchInternData();
    }
  }, [initialIntern]);

  const fetchInternData = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/users/interns/${internId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized access. Please log in again.");
        }
        if (response.status === 404) {
          throw new Error("Intern not found.");
        }
        throw new Error(`Failed to fetch intern: ${response.statusText}`);
      }

      const internData = await response.json();
      setIntern(internData);
    } catch (error: any) {
      console.error("Failed to fetch intern:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load intern profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchInternData();
  };

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

  const calculateProgress = (createdAt: string, duration: string | null): number => {
    if (!duration) return 0;
    
    const monthsMatch = duration.match(/(\d+)\s*month/i);
    if (!monthsMatch) return 0;
    
    const totalMonths = parseInt(monthsMatch[1]);
    const startDate = new Date(createdAt);
    const currentDate = new Date();
    
    const elapsedMonths = (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
                         (currentDate.getMonth() - startDate.getMonth());
    
    const progress = Math.min(100, Math.max(0, (elapsedMonths / totalMonths) * 100));
    return Math.round(progress);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

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

  const progress = calculateProgress(intern.createdAt, intern.duration);
  const reportsSubmitted = Math.floor((progress / 100) * 12);
  const totalReports = 12;

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
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <Loader2 className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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
                {intern.firstName} {intern.lastName}
              </h2>
              <p className="text-gray-600 mb-3">{intern.fieldOfStudy}</p>
              {getStatusBadge(intern.userStatus)}
              <div className="flex items-center justify-center mt-3">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600 ml-1">
                  4.5 Rating
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
              <p className="text-gray-700 leading-relaxed">
                {intern.bio || "No bio information available."}
              </p>
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
                      Field of Study
                    </label>
                    <p className="text-gray-900">{intern.fieldOfStudy}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Duration
                    </label>
                    <p className="text-gray-900">{intern.duration || "Not specified"}</p>
                  </div>
                  {intern.supervisor && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Supervisor
                      </label>
                      <p className="text-gray-900">
                        {intern.supervisor.firstName} {intern.supervisor.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{intern.supervisor.email}</p>
                    </div>
                  )}
                  {intern.projectManager && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Project Manager
                      </label>
                      <p className="text-gray-900">
                        {intern.projectManager.firstName} {intern.projectManager.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{intern.projectManager.email}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Start Date
                    </label>
                    <p className="text-gray-900">
                      {formatDate(intern.createdAt)}
                    </p>
                  </div>
                  {intern.duration && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Estimated End Date
                      </label>
                      <p className="text-gray-900">
                        {(() => {
                          const startDate = new Date(intern.createdAt);
                          const monthsMatch = intern.duration.match(/(\d+)\s*month/i);
                          if (monthsMatch) {
                            const months = parseInt(monthsMatch[1]);
                            const endDate = new Date(startDate);
                            endDate.setMonth(startDate.getMonth() + months);
                            return formatDate(endDate.toISOString());
                          }
                          return "Not specified";
                        })()}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Reports Submitted
                    </label>
                    <p className="text-gray-900">
                      {reportsSubmitted} / {totalReports}
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
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {progress}%
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
                  <p className="text-gray-900">{intern.fieldOfStudy}</p>
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
                {intern.fieldOfStudy.includes("Computer Science") && (
                  <>
                    <Badge variant="outline" className="text-sm">Java</Badge>
                    <Badge variant="outline" className="text-sm">Python</Badge>
                    <Badge variant="outline" className="text-sm">SQL</Badge>
                    <Badge variant="outline" className="text-sm">Algorithms</Badge>
                  </>
                )}
                {intern.fieldOfStudy.includes("Software Engineering") && (
                  <>
                    <Badge variant="outline" className="text-sm">React</Badge>
                    <Badge variant="outline" className="text-sm">Node.js</Badge>
                    <Badge variant="outline" className="text-sm">Git</Badge>
                    <Badge variant="outline" className="text-sm">Agile</Badge>
                  </>
                )}
                {intern.fieldOfStudy.includes("Data Science") && (
                  <>
                    <Badge variant="outline" className="text-sm">Python</Badge>
                    <Badge variant="outline" className="text-sm">R</Badge>
                    <Badge variant="outline" className="text-sm">Machine Learning</Badge>
                    <Badge variant="outline" className="text-sm">Statistics</Badge>
                  </>
                )}
                <Badge variant="outline" className="text-sm">Problem Solving</Badge>
                <Badge variant="outline" className="text-sm">Teamwork</Badge>
                <Badge variant="outline" className="text-sm">Communication</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Internship Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-semibold">Started Internship</p>
                    <p className="text-sm text-gray-600">{formatDate(intern.createdAt)}</p>
                    <p className="text-sm">Joined the internship program</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-semibold">Current Progress</p>
                    <p className="text-sm text-gray-600">{progress}% Complete</p>
                    <p className="text-sm">{reportsSubmitted} reports submitted</p>
                  </div>
                </div>
                {intern.duration && (
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 bg-gray-300 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-semibold">Expected Completion</p>
                      <p className="text-sm text-gray-600">
                        {(() => {
                          const startDate = new Date(intern.createdAt);
                          const monthsMatch = intern.duration.match(/(\d+)\s*month/i);
                          if (monthsMatch) {
                            const months = parseInt(monthsMatch[1]);
                            const endDate = new Date(startDate);
                            endDate.setMonth(startDate.getMonth() + months);
                            return formatDate(endDate.toISOString());
                          }
                          return "Not specified";
                        })()}
                      </p>
                      <p className="text-sm">Estimated end date</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}