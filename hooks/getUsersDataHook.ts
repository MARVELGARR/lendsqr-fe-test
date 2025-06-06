import { useQuery, keepPreviousData } from "@tanstack/react-query"
export interface UsersProp {
  id: string
  userId: string
  organization: string
  username: string
  email: string
  phoneNumber: string
  dateJoined: string
  status: "Active" | "Inactive" | "Blacklisted" | string // You can narrow this if all statuses are known
  avatar: string
  accountBalance: number
  bankInfo: {
    accountNumber: string
    bankName: string
  }
  personalInfo: {
    fullName: string
    phoneNumber: string
    email: string
    bvn: string
    gender: string
    maritalStatus: string
    children: string
    residenceType: string
  }
  education: {
    level: string
    employmentStatus: string
    sector: string
    duration: string
    officeEmail: string
    monthlyIncome: string
    loanRepayment: string
  }
  socials: {
    twitter: string
    facebook: string
    instagram: string
  }
  guarantors: {
    fullName: string
    phoneNumber: string
    email: string
    relationship: string
  }[]
}

export interface UsersQueryParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  filters?: Record<string, any>
}

const fetchUsers = async ({ page, pageSize, sortBy, sortOrder, filters }: UsersQueryParams) => {
  try {
    // Check if we have cached data in localStorage to avoid unnecessary fetches
    const cachedData = localStorage.getItem("users")
    let allUsers = []

    if (cachedData) {
      allUsers = JSON.parse(cachedData)
    } else {
      const res = await fetch(`https://run.mocky.io/v3/454f19ea-a684-4b15-867b-b9dc46675d57`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) throw new Error("Failed to fetch users")

      allUsers = await res.json()
      localStorage.setItem("users", JSON.stringify(allUsers))
    }

    // Apply filters if any - only filter on non-empty values
    let filteredUsers = allUsers
    if (filters) {
      filteredUsers = allUsers.filter((user: any) => {
        return Object.entries(filters).every(([key, value]) => {
          if (!value || String(value).trim() === "") return true

          const userValue = key.includes(".") ? key.split(".").reduce((obj, k) => obj?.[k], user) : user[key]

          if (userValue === null || userValue === undefined) return false

          return String(userValue).toLowerCase().includes(String(value).toLowerCase())
        })
      })
    }

    // Apply sorting
    if (sortBy) {
      filteredUsers = [...filteredUsers].sort((a: any, b: any) => {
        const aValue = sortBy.includes(".") ? sortBy.split(".").reduce((obj, k) => obj?.[k], a) : a[sortBy]
        const bValue = sortBy.includes(".") ? sortBy.split(".").reduce((obj, k) => obj?.[k], b) : b[sortBy]

        if (aValue < bValue) return sortOrder === "desc" ? 1 : -1
        if (aValue > bValue) return sortOrder === "desc" ? -1 : 1
        return 0
      })
    }

    // Paginate
    const totalCount = filteredUsers.length
    const totalPages = Math.ceil(totalCount / pageSize)
    const startIndex = page * pageSize
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize)

    await new Promise((resolve) => setTimeout(resolve, 100)) // Reduced simulated delay

    return {
      data: paginatedUsers,
      meta: {
        totalCount,
        totalPages,
        currentPage: page,
        pageSize,
      },
    }
  } catch (error) {
    console.error("Error fetching users:", error)
    throw new Error("Failed to fetch users")
  }
}

const useGetUserDataHook = (params: UsersQueryParams) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["usersData", params],
    queryFn: () => fetchUsers(params),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Disable refetching on window focus
  })

  return {
    usersData: data?.data || [],
    meta: data?.meta,
    isGettingUsersData: isLoading,
    isError,
    error,
  }
}

export default useGetUserDataHook
