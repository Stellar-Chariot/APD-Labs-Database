"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { MessageSquare, Reply, Edit, Trash, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useCollaborationStore } from "@/store/collaboration-store"
import { useAuthStore } from "@/store/auth-store"
import type { Comment, CommentType } from "@/types/collaboration-types"

const commentTypeColors: Record<CommentType, string> = {
  general: "bg-gray-100 text-gray-800",
  question: "bg-blue-100 text-blue-800",
  issue: "bg-red-100 text-red-800",
  suggestion: "bg-green-100 text-green-800",
}

const commentTypeLabels: Record<CommentType, string> = {
  general: "Comment",
  question: "Question",
  issue: "Issue",
  suggestion: "Suggestion",
}

interface CommentsProps {
  resourceType: "sample" | "measurement" | "project"
  resourceId: string
}

export function Comments({ resourceType, resourceId }: CommentsProps) {
  const { user } = useAuthStore()
  const { comments, fetchComments, addComment, updateComment, resolveComment, deleteComment, isLoading } =
    useCollaborationStore()

  const [content, setContent] = useState("")
  const [commentType, setCommentType] = useState<CommentType>("general")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  useEffect(() => {
    fetchComments(resourceType, resourceId)
  }, [fetchComments, resourceType, resourceId])

  // Filter and organize comments
  const topLevelComments = comments
    .filter((comment) => !comment.parentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const getReplies = (commentId: string) => {
    return comments
      .filter((comment) => comment.parentId === commentId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  const handleSubmit = async () => {
    if (!user || !content.trim()) return

    try {
      await addComment({
        resourceType,
        resourceId,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        content: content.trim(),
        type: commentType,
        parentId: replyTo,
      })

      setContent("")
      setCommentType("general")
      setReplyTo(null)
    } catch (error) {
      console.error("Failed to add comment:", error)
    }
  }

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return

    try {
      await updateComment(commentId, editContent.trim())
      setEditing(null)
      setEditContent("")
    } catch (error) {
      console.error("Failed to update comment:", error)
    }
  }

  const handleResolve = async (commentId: string) => {
    if (!user) return

    try {
      await resolveComment(commentId, user.id)
    } catch (error) {
      console.error("Failed to resolve comment:", error)
    }
  }

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId)
    } catch (error) {
      console.error("Failed to delete comment:", error)
    }
  }

  const startEditing = (comment: Comment) => {
    setEditing(comment.id)
    setEditContent(comment.content)
  }

  const cancelEditing = () => {
    setEditing(null)
    setEditContent("")
  }

  const startReplying = (commentId: string) => {
    setReplyTo(commentId)
    setCommentType("general")
  }

  const cancelReplying = () => {
    setReplyTo(null)
  }

  const renderComment = (comment: Comment, isReply = false) => {
    const replies = getReplies(comment.id)
    const canEdit = user?.id === comment.userId
    const canDelete = user?.id === comment.userId || user?.role === "admin"
    const canResolve = !comment.resolved && (user?.role === "admin" || user?.id === comment.userId)

    return (
      <div key={comment.id} className={`mb-4 ${isReply ? "ml-8" : ""}`}>
        <Card>
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {comment.userName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{comment.userName}</div>
                  <div className="text-xs text-muted-foreground capitalize">{comment.userRole}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={commentTypeColors[comment.type]}>{commentTypeLabels[comment.type]}</Badge>
                {comment.resolved && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Resolved
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            {editing === comment.id ? (
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[100px]"
              />
            ) : (
              <div className="whitespace-pre-wrap">{comment.content}</div>
            )}
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between items-center text-sm text-muted-foreground">
            <div>
              {format(new Date(comment.createdAt), "MMM d, yyyy h:mm a")}
              {comment.updatedAt !== comment.createdAt && " (edited)"}
              {comment.resolved && comment.resolvedAt && (
                <span className="ml-2">• Resolved {format(new Date(comment.resolvedAt), "MMM d, yyyy")}</span>
              )}
            </div>
            <div className="flex gap-2">
              {editing === comment.id ? (
                <>
                  <Button size="sm" variant="ghost" onClick={cancelEditing}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={() => handleEdit(comment.id)}>
                    Save
                  </Button>
                </>
              ) : (
                <>
                  {!comment.resolved && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startReplying(comment.id)}
                      disabled={replyTo === comment.id}
                    >
                      <Reply className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                  )}
                  {canEdit && !comment.resolved && (
                    <Button size="sm" variant="ghost" onClick={() => startEditing(comment)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                  {canResolve && (
                    <Button size="sm" variant="ghost" onClick={() => handleResolve(comment.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Resolve
                    </Button>
                  )}
                  {canDelete && (
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(comment.id)}>
                      <Trash className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardFooter>
        </Card>

        {replyTo === comment.id && (
          <div className="mt-2 ml-8">
            <Card>
              <CardContent className="p-4">
                <Textarea
                  placeholder="Write a reply..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[100px]"
                />
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                <Button variant="outline" onClick={cancelReplying}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!content.trim()}>
                  Reply
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {replies.length > 0 && <div className="mt-2">{replies.map((reply) => renderComment(reply, true))}</div>}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h3 className="text-lg font-medium">Comments</h3>
        </div>
        <Badge variant="outline">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </Badge>
      </div>

      {!replyTo && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 mb-2">
              <Select value={commentType} onValueChange={(value) => setCommentType(value as CommentType)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Comment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Comment</SelectItem>
                  <SelectItem value="question">Question</SelectItem>
                  <SelectItem value="issue">Issue</SelectItem>
                  <SelectItem value="suggestion">Suggestion</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder={`Write a ${commentType}...`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px]"
              disabled={!user}
            />
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between">
            {!user && <div className="text-sm text-muted-foreground">You need to be logged in to comment</div>}
            <div className="ml-auto">
              <Button onClick={handleSubmit} disabled={!user || !content.trim()}>
                Submit
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No comments yet. Be the first to comment!</div>
      ) : (
        <div>{topLevelComments.map((comment) => renderComment(comment))}</div>
      )}
    </div>
  )
}

