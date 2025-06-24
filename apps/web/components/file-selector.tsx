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
  "data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=indeterminate]:bg-blue-600 data-[state=indeterminate]:border-blue-600 border-gray-500"

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
          <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 border-2 border-zinc-800 flex justify-center items-center rounded-full bg-sidebar-primary text-white h-6 w-6">
            {selectedFiles.size}
          </div>
          <FileText aria-label="Select Files" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] flex flex-col h-[70vh]">
        <DialogHeader>
          <DialogTitle>File Selection</DialogTitle>
          <DialogDescription>
            Select the files you want to include.
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
              className="text-white font-semibold cursor-pointer"
            >
              All Files
            </label>
            <span className="text-blue-400 text-xs font-medium bg-blue-900/30 px-2 py-1 rounded">
              {selectedFiles.size}/{allIds.length} selected
            </span>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto overflow-x-hidden space-y-6 pb-4">
          {Object.entries(data)
            .filter(([_, files]) => files.length > 0)
            .map(([groupName, files]) => (
              <div key={groupName}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 py-1">
                    <Checkbox
                      id={`group-${groupName}`}
                      checked={groupStates[groupName]}
                      onCheckedChange={() =>
                        handleGroupToggle(groupName as FileTypeKey)
                      }
                      data-state={
                        isGroupIndeterminate(groupName as FileTypeKey)
                          ? "indeterminate"
                          : groupStates[groupName]
                            ? "checked"
                            : "unchecked"
                      }
                      className={checkboxClasses}
                    />
                    <label
                      htmlFor={`group-${groupName}`}
                      className="text-white font-semibold cursor-pointer capitalize"
                    >
                      {groupName}
                    </label>
                  </div>

                  <div className="ml-8 space-y-2 bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
                    {files.map(file => (
                      <div
                        key={file.id}
                        className="flex items-center space-x-3 py-1 hover:bg-gray-700/30 rounded px-2 transition-colors"
                      >
                        <Checkbox
                          id={`file-${file.id}`}
                          checked={selectedFiles.has(file.id)}
                          onCheckedChange={() => handleFileToggle(file.id)}
                          className={checkboxClasses}
                        />
                        <label
                          htmlFor={`file-${file.id}`}
                          className="text-gray-200 cursor-pointer font-medium truncate"
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
