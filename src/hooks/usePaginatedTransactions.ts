import { useCallback, useState } from "react"
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types"
import { PaginatedTransactionsResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function usePaginatedTransactions(
  setIsNextPage: (value: boolean) => void
): PaginatedTransactionsResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<
    Transaction[]
  > | null>(null)

  const fetchAll = useCallback(async () => {
    if (paginatedTransactions && paginatedTransactions.nextPage === null) {
      return
    }
    const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
      "paginatedTransactions",
      {
        page: paginatedTransactions === null ? 0 : paginatedTransactions.nextPage,
      }
    )

    setPaginatedTransactions((previousResponse) => {
      if (response === null) {
        return previousResponse
      }
      const newData = response.data
      const nextPage = response.nextPage
      if (nextPage === null) {
        setIsNextPage(false)
      }
      if (previousResponse === null) {
        return { data: newData, nextPage }
      }

      const existingData = previousResponse.data
      return { data: [...existingData, ...newData], nextPage }
    })
  }, [fetchWithCache, paginatedTransactions, setIsNextPage])

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null)
  }, [])

  return { data: paginatedTransactions, loading, fetchAll, invalidateData }
}
