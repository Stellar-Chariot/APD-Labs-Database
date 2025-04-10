import { Heading } from "@/components/ui/heading"
import { RecipeList } from "@/components/recipes/recipe-list"
import { CreateRecipeButton } from "@/components/recipes/create-recipe-button"

export default function RecipesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Heading title="MBE Recipes" description="Manage your growth recipes" />
        <CreateRecipeButton />
      </div>
      <RecipeList />
    </div>
  )
}
