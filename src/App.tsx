import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { AuthGuard } from '@/admin/components/AuthGuard'
import logo from '@/assets/logo.png'

const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })))
const ProductsPage = lazy(() => import('@/pages/ProductsPage').then((m) => ({ default: m.ProductsPage })))
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })))
const IndustriesPage = lazy(() => import('@/pages/IndustriesPage').then((m) => ({ default: m.IndustriesPage })))
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })))
const AboutPage = lazy(() => import('@/pages/AboutPage').then((m) => ({ default: m.AboutPage })))
const BlogPage = lazy(() => import('@/pages/BlogPage').then((m) => ({ default: m.BlogPage })))
const ContactPage = lazy(() => import('@/pages/ContactPage').then((m) => ({ default: m.ContactPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

const LoginPage = lazy(() => import('@/admin/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const AdminLayout = lazy(() => import('@/admin/components/AdminLayout').then((m) => ({ default: m.AdminLayout })))
const OverviewPage = lazy(() => import('@/admin/pages/OverviewPage').then((m) => ({ default: m.OverviewPage })))
const LeadsPage = lazy(() => import('@/admin/pages/LeadsPage').then((m) => ({ default: m.LeadsPage })))
const CustomersPage = lazy(() => import('@/admin/pages/CustomersPage').then((m) => ({ default: m.CustomersPage })))
const CustomerDetailPage = lazy(() => import('@/admin/pages/CustomerDetailPage').then((m) => ({ default: m.CustomerDetailPage })))
const ProductCatalogPage = lazy(() => import('@/admin/pages/ProductCatalogPage').then((m) => ({ default: m.ProductCatalogPage })))
const DocumentsListPage = lazy(() => import('@/admin/pages/DocumentsListPage').then((m) => ({ default: m.DocumentsListPage })))
const DocumentEditorPage = lazy(() => import('@/admin/pages/DocumentEditorPage').then((m) => ({ default: m.DocumentEditorPage })))
const ReportsPage = lazy(() => import('@/admin/pages/ReportsPage').then((m) => ({ default: m.ReportsPage })))
const BlogPostsPage = lazy(() => import('@/admin/pages/BlogPostsPage').then((m) => ({ default: m.BlogPostsPage })))
const BlogPostEditorPage = lazy(() => import('@/admin/pages/BlogPostEditorPage').then((m) => ({ default: m.BlogPostEditorPage })))
const BlogPostPage = lazy(() => import('@/pages/BlogPostPage').then((m) => ({ default: m.BlogPostPage })))
const AdminProjectsPage = lazy(() => import('@/admin/pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })))
const ProjectEditorPage = lazy(() => import('@/admin/pages/ProjectEditorPage').then((m) => ({ default: m.ProjectEditorPage })))
const SalesPipelinePage = lazy(() => import('@/admin/pages/SalesPipelinePage').then((m) => ({ default: m.SalesPipelinePage })))
const CatalogPage = lazy(() => import('@/admin/pages/CatalogPage').then((m) => ({ default: m.CatalogPage })))

const queryClient = new QueryClient()

function PageFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-navy">
      <div className="flex flex-col items-center gap-5">
        <img src={logo} alt="Al Surur" className="h-10 w-auto animate-pulse rounded-lg bg-white/95 px-2 py-1.5" />
        <div className="h-0.5 w-24 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/3 animate-[loading-bar_1.1s_ease-in-out_infinite] rounded-full bg-primary" />
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="dashboard/login" element={<LoginPage />} />
            <Route
              path="dashboard"
              element={
                <AuthGuard>
                  <AdminLayout />
                </AuthGuard>
              }
            >
              <Route index element={<OverviewPage />} />
              <Route path="leads" element={<LeadsPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="customers/:id" element={<CustomerDetailPage />} />
              <Route path="products" element={<ProductCatalogPage />} />
              <Route path="documents" element={<DocumentsListPage />} />
              <Route path="documents/new" element={<DocumentEditorPage />} />
              <Route path="documents/:id" element={<DocumentEditorPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="blog" element={<BlogPostsPage />} />
              <Route path="blog/new" element={<BlogPostEditorPage />} />
              <Route path="blog/:id" element={<BlogPostEditorPage />} />
              <Route path="projects" element={<AdminProjectsPage />} />
              <Route path="projects/new" element={<ProjectEditorPage />} />
              <Route path="projects/:id" element={<ProjectEditorPage />} />
              <Route path="pipeline" element={<SalesPipelinePage />} />
              <Route path="catalog" element={<CatalogPage />} />
            </Route>

            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/:slug" element={<ProductDetailPage />} />
              <Route path="industries" element={<IndustriesPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="blog" element={<BlogPage />} />
              <Route path="blog/:slug" element={<BlogPostPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
