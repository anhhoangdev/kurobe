import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart3, MessageSquare, Database, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Kurobe</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/questions">
              <Button variant="outline">Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Turn Questions into{" "}
            <span className="text-blue-600">Interactive Dashboards</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Kurobe is a production-ready BI chat platform that transforms natural language questions 
            into beautiful, interactive dashboard panels with pluggable AI engines.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/questions">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start Asking Questions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboards">
              <Button size="lg" variant="outline">
                View Dashboards
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <Card>
            <CardHeader>
              <MessageSquare className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Chat to Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Ask questions in natural language and get instant visualizations and insights.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Smart Panels</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Each question generates interactive panels that you can pin to create dashboards.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Database className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Multi-Database</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Connect to PostgreSQL, Trino, DuckDB, and more with our flexible connector system.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Pluggable Engines</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Swap AI engines via configuration - support for Anthropic, OpenAI, and local models.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Demo Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            See It In Action
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="text-left">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 inline-block">
                  <p className="text-blue-900 dark:text-blue-100">
                    "Show me monthly sales trends for 2024"
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 inline-block">
                  <p className="text-gray-900 dark:text-gray-100">
                    I've generated a line chart showing your monthly sales trends. 
                    The data shows steady growth with a spike in November. Would you like me to break this down by product category?
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Generated Panel: Line Chart</div>
              <div className="h-40 bg-gradient-to-r from-blue-200 to-blue-300 dark:from-blue-800 dark:to-blue-700 rounded flex items-center justify-center">
                <BarChart3 className="h-16 w-16 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-gray-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              © 2024 Kurobe BI Platform. Built with ❤️ for the data community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
