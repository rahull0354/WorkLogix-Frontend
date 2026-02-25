'use client';

import { ReactNode, useState } from "react";
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'

export function QueryProvider({children}: {children: ReactNode}) {
    const [queryClient] = useState(
        () => new QueryClient({
            defaultOptions: {
                queries: {
                    // data statys fresh for 5 mins
                    staleTime: 5 * 60 * 1000,
                    // cache data for 10 minutes
                    gcTime: 10 * 60 * 1000,
                    // dont refetch on window foucs
                    refetchOnWindowFocus: false,
                    // retry failed request 3 times
                    retry: 3
                },
                mutations: {
                    // retry failed mutations once
                    retry: 1
                }
            }
        })
    )

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}