"use client";

import { useState } from "react";
import { Milestone, Task } from "@/types/entities";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Plus, Check, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

interface PlansClientProps {
  initialMilestones: Milestone[];
  initialTasks: Task[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  userId: number;
  onCreateTask: (
    taskData: Omit<Task, "scheduleId" | "createdAt">
  ) => Promise<Task>;
  onUpdateStatus: (
    scheduleId: number,
    status: "PENDING" | "UPCOMING" | "COMPLETED"
  ) => Promise<Task>;
  onDeleteTask: (scheduleId: number) => Promise<void>;
}

export default function PlansClient({
  initialMilestones,
  initialTasks,
  pagination,
  userId,
  onCreateTask,
  onUpdateStatus,
  onDeleteTask,
}: PlansClientProps) {
  const router = useRouter();
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTask, setNewTask] = useState<
    Omit<Task, "scheduleId" | "createdAt" | "userId">
  >({
    title: "",
    description: "",
    dueDate: "",
    status: "UPCOMING",
  });
  const [page, setPage] = useState(pagination.currentPage);
  const [taskPage, setTaskPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pageSize = 3;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    router.push(`/dashboard/student/plans?page=${newPage}`);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const createdTask = await onCreateTask({
        ...newTask,
        userId,
        status: "UPCOMING",
      });

      setTasks([createdTask, ...tasks]);
      setNewTask({
        title: "",
        description: "",
        dueDate: "",
        status: "UPCOMING",
      });
      setDialogOpen(false);
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const markTaskAsDone = async (scheduleId: number) => {
    try {
      await onUpdateStatus(scheduleId, "COMPLETED");
      setTasks(
        tasks.map((task) =>
          task.scheduleId === scheduleId
            ? { ...task, status: "COMPLETED" }
            : task
        )
      );
      toast({
        title: "Success",
        description: "Task marked as completed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
      console.error("Failed to update task status:", error);
    }
  };

  const deleteTask = async (scheduleId: number) => {
    try {
      await onDeleteTask(scheduleId);
      setTasks(tasks.filter((task) => task.scheduleId !== scheduleId));
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const paginatedTasks = tasks
    .sort((a, b) => (a.status === "PENDING" ? -1 : 1))
    .slice((taskPage - 1) * pageSize, taskPage * pageSize);

  const totalTaskPages = Math.ceil(tasks.length / pageSize);

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Plans & Tasks</h1>
          <p className="text-gray-600">
            Organize and track your milestones and tasks
          </p>
        </div>
      </div>

      {/* Milestones List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Milestones</h2>
        {milestones.length > 0 ? (
          milestones.map((milestone) => (
            <Card
              key={milestone.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {milestone.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {milestone.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>📅 Due: {formatDate(milestone.dueDate)}</span>
                    </div>
                  </div>
                  <Badge
                    className={
                      milestone.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : milestone.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }
                  >
                    {milestone.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              No milestones found
            </CardContent>
          </Card>
        )}
      </div>

      {/* Milestones Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 0) handlePageChange(page - 1);
                }}
              />
            </PaginationItem>
            {[...Array(pagination.totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={page === i}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(i);
                  }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page < pagination.totalPages - 1)
                    handlePageChange(page + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Tasks Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Your Tasks</CardTitle>
          <CardDescription>
            Tasks specific to your role as a student
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paginatedTasks.length > 0 ? (
            paginatedTasks.map((task) => (
              <div
                key={task.scheduleId}
                className={`p-4 rounded-lg border ${
                  task.status !== "COMPLETED" ? "bg-white" : "bg-gray-50"
                }`}
              >
                {task.status !== "COMPLETED" ? (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{task.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">
                            Due: {formatDate(task.dueDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:bg-green-50"
                        onClick={() => markTaskAsDone(task.scheduleId)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Mark Done
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => deleteTask(task.scheduleId)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center line-through text-gray-500">
                    <span>{task.title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => deleteTask(task.scheduleId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              No tasks to display
            </div>
          )}

          {/* Task Creation Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <Input
                  placeholder="Title"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  required
                />
                <Input
                  placeholder="Description"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  required
                />
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                  required
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create Task"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Tasks Pagination */}
          {totalTaskPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setTaskPage((p) => Math.max(1, p - 1));
                    }}
                  />
                </PaginationItem>
                {[...Array(totalTaskPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      isActive={taskPage === i + 1}
                      onClick={(e) => {
                        e.preventDefault();
                        setTaskPage(i + 1);
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setTaskPage((p) => Math.min(totalTaskPages, p + 1));
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>

      {/* Guidelines Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Plans & Tasks Guidelines</CardTitle>
          <CardDescription>
            What to include in your milestones and tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">Required Sections:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Clear task objectives</li>
              <li>• Deadlines and milestones</li>
              <li>• Resources or support needed</li>
              <li>• Expected outcomes</li>
              <li>• Progress tracking</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Tips for Success:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Break down large goals into smaller tasks</li>
              <li>• Set realistic deadlines</li>
              <li>• Review and update your plans regularly</li>
              <li>• Communicate with your mentor or supervisor</li>
              <li>• Reflect on completed tasks for improvement</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
