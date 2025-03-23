import RecipeDetail from "@/components/recipe-detail"

export default function RecipeDetailPage({ params }: { params: { id: string } }) {
  return <RecipeDetail id={params.id} />
}

