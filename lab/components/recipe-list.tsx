"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Filter } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RecipeList() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [grower, setGrower] = useState("")
  const [substrate, setSubstrate] = useState("")

  // In a real implementation, this would be fetched via GraphQL
  const recipes = [
    {
      id: "r1",
      identifier: "B200319A",
      name: "GaAs/AlGaAs QW",
      growthDate: new Date("2020-03-19"),
      substrate: "GaAs",
      grower: "Scott Sifferman",
      samples: 3,
      layers: 6,
    },
    {
      id: "r2",
      identifier: "B200320B",
      name: "AlGaAs Barrier Test",
      growthDate: new Date("2020-03-20"),
      substrate: "GaAs",
      grower: "Maria Chen",
      samples: 2,
      layers: 5,
    },
    {
      id: "r3",
      identifier: "B200321C",
      name: "InGaAs QD Recipe",
      growthDate: new Date("2020-03-21"),
      substrate: "InP",
      grower: "Scott Sifferman",
      samples: 4,
      layers: 8,
    },
    {
      id: "r4",
      identifier: "B200322D",
      name: "GaN HEMT Structure",
      growthDate: new Date("2020-03-22"),
      substrate: "Sapphire",
      grower: "James Wilson",
      samples: 1,
      layers: 7,
    },
    {
      id: "r5",
      identifier: "B200323E",
      name: "AlN Buffer Layer",
      growthDate: new Date("2020-03-23"),
      substrate: "SiC",
      grower: "Maria Chen",
      samples: 2,
      layers: 4,
    },
    {
      id: "r6",
      identifier: "B200324F",
      name: "InGaAs/GaAs SL",
      growthDate: new Date("2020-03-24"),
      substrate: "GaAs",
      grower: "Scott Sifferman",
      samples: 3,
      layers: 12,
    },
    {
      id: "r7",
      identifier: "B200325G",
      name: "AlGaN/GaN HEMT",
      growthDate: new Date("2020-03-25"),
      substrate: "Sapphire",
      grower: "James Wilson",
      samples: 2,
      layers: 9,
    },
  ]

  // Filter recipes based on search and filter criteria
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      search === "" ||
      recipe.identifier.toLowerCase().includes(search.toLowerCase()) ||
      recipe.name.toLowerCase().includes(search.toLowerCase())

    const matchesGrower = grower === "" || recipe.grower === grower
    const matchesSubstrate = substrate === "" || recipe.substrate === substrate

    return matchesSearch && matchesGrower && matchesSubstrate
  })

  // Get unique growers and substrates for filter dropdowns
  const growers = Array.from(new Set(recipes.map((r) => r.grower)))
  const substrates = Array.from(new Set(recipes.map((r) => r.substrate)))

  // Pagination
  const itemsPerPage = 5
  const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage)
  const paginatedRecipes = filteredRecipes.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  // Update the handleAddNewRecipe function to navigate to the new recipe form page
  const handleAddNewRecipe = () => {
    router.push("/recipes/new")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">MBE Recipe Management</h1>
        <Button className="bg-primary hover:bg-primary/90" onClick={handleAddNewRecipe}>
          <Plus className="mr-2 h-4 w-4" /> Add New Recipe
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recipe List</CardTitle>
          <CardDescription>Browse and manage all MBE growth recipes in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <div className="flex-1">
                <Input
                  placeholder="Search by ID or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <Select value={grower} onValueChange={setGrower}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by grower" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Growers</SelectItem>
                    {growers.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={substrate} onValueChange={setSubstrate}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by substrate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Substrates</SelectItem>
                    {substrates.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Growth Date</TableHead>
                    <TableHead>Substrate</TableHead>
                    <TableHead>Grower</TableHead>
                    <TableHead>Layers</TableHead>
                    <TableHead>Samples</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRecipes.map((recipe) => (
                    <TableRow key={recipe.id}>
                      <TableCell className="font-medium">{recipe.identifier}</TableCell>
                      <TableCell>{recipe.name}</TableCell>
                      <TableCell>{recipe.growthDate.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{recipe.substrate}</Badge>
                      </TableCell>
                      <TableCell>{recipe.grower}</TableCell>
                      <TableCell>{recipe.layers}</TableCell>
                      <TableCell>{recipe.samples}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/recipes/${recipe.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {paginatedRecipes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No recipes found matching your criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (page > 1) setPage(page - 1)
                    }}
                    className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setPage(i + 1)
                      }}
                      isActive={page === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (page < totalPages) setPage(page + 1)
                    }}
                    className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

