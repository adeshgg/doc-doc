import { useTRPC } from "@/trpc/react"
import { useQuery } from "@tanstack/react-query"
import { FILE_TYPE_VALUES } from "@workspace/db/schema"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { FileText } from "lucide-react"
import { Dispatch, SetStateAction, useMemo } from "react"

type FileTypeKey = (typeof FILE_TYPE_VALUES)[number]

const checkboxClasses =
  "data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=indeterminate]:bg-blue-600 data-[state=indeterminate]:border-blue-600 border-zinc-300 dark:border-zinc-600"

const FileSelector = ({
  selectedFiles,
  setSelectedFiles,
}: {
  selectedFiles: Set<string>
  setSelectedFiles: Dispatch<SetStateAction<Set<string>>>
}) => {
  const trpc = useTRPC()
  const { data, isError, isLoading, isSuccess } = useQuery(
    trpc.file.getFileByType.queryOptions()
  )

  const allIds = useMemo(() => {
    if (!data) return []
    // Calculate the flat list of all file IDs once.
    return Object.values(data)
      .flat()
      .map(file => file.id)
  }, [data])

  const groupStates = useMemo<{ [key: string]: boolean }>(() => {
    if (!data) return {}
    const newGroupStates: { [key: string]: boolean } = {}
    for (const [groupName, files] of Object.entries(data)) {
      if (files.length === 0) {
        newGroupStates[groupName] = false
        continue
      }
      const allFilesInGroupSelected = files.every(file =>
        selectedFiles.has(file.id)
      )
      newGroupStates[groupName] = allFilesInGroupSelected
    }
    return newGroupStates
  }, [selectedFiles, data])

  const selectAllState = useMemo(() => {
    return allIds.length > 0 && selectedFiles.size === allIds.length
  }, [selectedFiles, allIds])

  const isSelectAllIndeterminate = useMemo(() => {
    return selectedFiles.size > 0 && selectedFiles.size < allIds.length
  }, [selectedFiles, allIds])

  if (isLoading) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant={"secondary"}>
            <FileText aria-label="Select Files" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Loading Files...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  if (isError || !isSuccess || !data) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant={"secondary"} disabled>
            <FileText aria-label="Select Files" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>
              Could not load files. Please try again later.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  const handleFileToggle = (fileId: string) => {
    const newSelected = new Set(selectedFiles)
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId)
    } else {
      newSelected.add(fileId)
    }
    setSelectedFiles(newSelected)
  }

  const handleGroupToggle = (groupName: FileTypeKey) => {
    const groupFileIds = data[groupName]?.map(file => file.id) ?? []
    const newSelected = new Set(selectedFiles)

    // If the group is already fully selected (based on our derived `groupStates`),
    // deselect all its files. Otherwise, select all its files.
    if (groupStates[groupName]) {
      groupFileIds.forEach(id => newSelected.delete(id))
    } else {
      groupFileIds.forEach(id => newSelected.add(id))
    }
    setSelectedFiles(newSelected)
  }

  const handleSelectAll = () => {
    if (selectAllState) {
      setSelectedFiles(new Set())
    } else {
      setSelectedFiles(new Set(allIds))
    }
  }

  const isGroupIndeterminate = (groupName: FileTypeKey) => {
    const groupFileIds = data[groupName]?.map(file => file.id) ?? []
    const selectedCount = groupFileIds.filter(id =>
      selectedFiles.has(id)
    ).length
    return selectedCount > 0 && selectedCount < groupFileIds.length
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"secondary"} className="relative">
          <div className="absolute top-0 right-0 flex h-6 w-6 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-sm font-bold text-white dark:border-zinc-900">
            {selectedFiles.size}
          </div>
          <FileText aria-label="Select Files" />
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-[70vh] flex-col sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>File Selection</DialogTitle>
          <DialogDescription>
            Select the files you want to include in your request.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-shrink-0">
          <div className="flex items-center space-x-3 pb-4">
            <Checkbox
              id="select-all"
              checked={selectAllState}
              onCheckedChange={handleSelectAll}
              // Set the data-state attribute directly for clearer logic.
              data-state={
                isSelectAllIndeterminate
                  ? "indeterminate"
                  : selectAllState
                    ? "checked"
                    : "unchecked"
              }
              className={checkboxClasses}
            />
            <label
              htmlFor="select-all"
              className="cursor-pointer font-semibold text-zinc-900 dark:text-zinc-50"
            >
              All Files
            </label>
            <span className="rounded px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
              {selectedFiles.size}/{allIds.length} selected
            </span>
          </div>
        </div>

        <div className="flex-grow space-y-6 overflow-y-auto overflow-x-hidden pb-4">
          {Object.entries(data)
            .filter(([_, files]) => files.length > 0)
            .map(([groupName, files]) => (
              <div key={groupName}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 py-1">
                    <Checkbox
                      id={`group-${groupName}`}
                      checked={groupStates[groupName as FileTypeKey]}
                      onCheckedChange={() =>
                        handleGroupToggle(groupName as FileTypeKey)
                      }
                      data-state={
                        isGroupIndeterminate(groupName as FileTypeKey)
                          ? "indeterminate"
                          : groupStates[groupName as FileTypeKey]
                            ? "checked"
                            : "unchecked"
                      }
                      className={checkboxClasses}
                    />
                    <label
                      htmlFor={`group-${groupName}`}
                      className="cursor-pointer text-base font-semibold capitalize text-zinc-900 dark:text-zinc-50"
                    >
                      {groupName}
                    </label>
                  </div>

                  <div className="ml-8 space-y-2 rounded-lg border p-3 bg-zinc-50 border-zinc-200 dark:bg-zinc-800/30 dark:border-zinc-700/50">
                    {files.map(file => (
                      <div
                        key={file.id}
                        className="flex items-center space-x-3 rounded px-2 py-1 transition-colors hover:bg-zinc-200/60 dark:hover:bg-zinc-700/40"
                      >
                        <Checkbox
                          id={`file-${file.id}`}
                          checked={selectedFiles.has(file.id)}
                          onCheckedChange={() => handleFileToggle(file.id)}
                          className={checkboxClasses}
                        />
                        <label
                          htmlFor={`file-${file.id}`}
                          className="truncate cursor-pointer font-medium text-zinc-600 dark:text-zinc-300"
                          title={file.name}
                        >
                          {file.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default FileSelector
