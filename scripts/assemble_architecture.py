#!/usr/bin/env python3
# script: assemble_architecture.py

import os
import json
import subprocess
from pathlib import Path
from typing import Dict, List, Any, Set, Tuple
import ast
import re
import logging

class ArchitectureMapper:
    """راسم خرائط المعمارية والتبعيات"""

    def __init__(self, repo_path: str, output_dir: str):
        self.repo_path = Path(repo_path)
        self.output_dir = Path(output_dir)
        self.logger = logging.getLogger(__name__)

    def generate_dependency_graph(self) -> Dict[str, Any]:
        """إنتاج خريطة التبعيات"""
        self.logger.info("🗺️ إنتاج خريطة التبعيات...")

        graph_data = {
            "modules": {},
            "dependencies": [],
            "circular_dependencies": [],
            "metrics": {
                "total_modules": 0,
                "total_connections": 0,
                "max_depth": 0,
                "coupling_score": 0.0
            }
        }

        # تحليل JavaScript/TypeScript
        if self._has_js_project():
            js_graph = self._analyze_js_dependencies()
            graph_data.update(js_graph)

        # تحليل Python
        elif self._has_python_project():
            python_graph = self._analyze_python_dependencies()
            graph_data.update(python_graph)

        # إنتاج مخطط بصري
        self._generate_visual_graph(graph_data)

        # حفظ البيانات
        with open(self.output_dir / "artifacts/assemble/dependency_graph.json", "w") as f:
            json.dump(graph_data, f, indent=2, ensure_ascii=False)

        return graph_data

    def _has_js_project(self) -> bool:
        """فحص وجود مشروع JavaScript/TypeScript"""
        return (self.repo_path / "package.json").exists()

    def _has_python_project(self) -> bool:
        """فحص وجود مشروع Python"""
        return (
            (self.repo_path / "setup.py").exists() or
            (self.repo_path / "requirements.txt").exists() or
            (self.repo_path / "pyproject.toml").exists()
        )

    def _analyze_js_dependencies(self) -> Dict[str, Any]:
        """تحليل تبعيات JavaScript/TypeScript"""
        try:
            # استخدام madge لتحليل التبعيات
            result = subprocess.run(
                ["npx", "madge", "--json", str(self.repo_path / "src")],
                capture_output=True,
                text=True,
                timeout=120,
                cwd=self.repo_path
            )

            if result.returncode == 0:
                madge_data = json.loads(result.stdout)

                # تحويل بيانات madge إلى تنسيق موحد
                modules = {}
                dependencies = []

                for module, deps in madge_data.items():
                    module_name = Path(module).stem
                    modules[module_name] = {
                        "path": module,
                        "type": "module",
                        "dependencies": deps,
                        "dependents": []
                    }

                    for dep in deps:
                        dep_name = Path(dep).stem
                        dependencies.append({
                            "from": module_name,
                            "to": dep_name,
                            "type": "import"
                        })

                # حساب التبعيات العكسية
                for dep in dependencies:
                    if dep["to"] in modules:
                        modules[dep["to"]]["dependents"].append(dep["from"])

                # كشف التبعيات الدورية
                circular = self._detect_circular_dependencies(dependencies)

                return {
                    "modules": modules,
                    "dependencies": dependencies,
                    "circular_dependencies": circular,
                    "metrics": self._calculate_dependency_metrics(modules, dependencies)
                }

        except (subprocess.TimeoutExpired, json.JSONDecodeError, FileNotFoundError):
            self.logger.warning("⚠️ فشل تحليل تبعيات JavaScript")

        return {"modules": {}, "dependencies": [], "circular_dependencies": []}

    def _analyze_python_dependencies(self) -> Dict[str, Any]:
        """تحليل تبعيات Python"""
        modules = {}
        dependencies = []

        # فحص ملفات Python
        for py_file in self.repo_path.rglob("*.py"):
            if any(part.startswith('.') for part in py_file.parts):
                continue

            module_name = py_file.stem
            relative_path = py_file.relative_to(self.repo_path)

            try:
                with open(py_file, 'r', encoding='utf-8') as f:
                    content = f.read()

                # تحليل الـ imports
                tree = ast.parse(content)
                imports = self._extract_python_imports(tree)

                modules[module_name] = {
                    "path": str(relative_path),
                    "type": "python_module",
                    "dependencies": imports,
                    "dependents": [],
                    "functions": self._extract_python_functions(tree),
                    "classes": self._extract_python_classes(tree)
                }

                for imp in imports:
                    dependencies.append({
                        "from": module_name,
                        "to": imp,
                        "type": "import"
                    })

            except (SyntaxError, UnicodeDecodeError) as e:
                self.logger.warning(f"⚠️ تعذر تحليل {py_file}: {e}")

        # حساب التبعيات العكسية
        for dep in dependencies:
            if dep["to"] in modules:
                modules[dep["to"]]["dependents"].append(dep["from"])

        circular = self._detect_circular_dependencies(dependencies)

        return {
            "modules": modules,
            "dependencies": dependencies,
            "circular_dependencies": circular,
            "metrics": self._calculate_dependency_metrics(modules, dependencies)
        }

    def _extract_python_imports(self, tree: ast.AST) -> List[str]:
        """استخراج الـ imports من AST"""
        imports = []

        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imports.append(alias.name.split('.')[0])
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    imports.append(node.module.split('.')[0])

        return list(set(imports))

    def _extract_python_functions(self, tree: ast.AST) -> List[str]:
        """استخراج أسماء الدوال"""
        functions = []

        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                functions.append(node.name)

        return functions

    def _extract_python_classes(self, tree: ast.AST) -> List[str]:
        """استخراج أسماء الفئات"""
        classes = []

        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                classes.append(node.name)

        return classes

    def _detect_circular_dependencies(self, dependencies: List[Dict]) -> List[List[str]]:
        """كشف التبعيات الدورية"""
        # بناء الرسم البياني
        graph = {}
        for dep in dependencies:
            if dep["from"] not in graph:
                graph[dep["from"]] = []
            graph[dep["from"]].append(dep["to"])

        # البحث عن الدورات
        visited = set()
        rec_stack = set()
        cycles = []

        def dfs(node: str, path: List[str]) -> None:
            if node in rec_stack:
                # عثرنا على دورة
                cycle_start = path.index(node)
                cycle = path[cycle_start:] + [node]
                cycles.append(cycle)
                return

            if node in visited:
                return

            visited.add(node)
            rec_stack.add(node)
            path.append(node)

            for neighbor in graph.get(node, []):
                dfs(neighbor, path[:])

            rec_stack.remove(node)
            path.pop()

        for node in graph:
            if node not in visited:
                dfs(node, [])

        return cycles

    def _calculate_dependency_metrics(self, modules: Dict, dependencies: List[Dict]) -> Dict[str, Any]:
        """حساب مؤشرات التبعيات"""
        if not modules:
            return {"total_modules": 0, "total_connections": 0, "coupling_score": 0.0}

        total_modules = len(modules)
        total_connections = len(dependencies)

        # حساب متوسط الـ coupling
        coupling_scores = []
        for module_name, module_data in modules.items():
            efferent = len(module_data.get("dependencies", []))  # صادر
            afferent = len(module_data.get("dependents", []))    # وارد

            if efferent + afferent > 0:
                instability = efferent / (efferent + afferent)
                coupling_scores.append(instability)

        avg_coupling = sum(coupling_scores) / len(coupling_scores) if coupling_scores else 0.0

        return {
            "total_modules": total_modules,
            "total_connections": total_connections,
            "average_coupling": round(avg_coupling, 3),
            "coupling_distribution": {
                "low": len([s for s in coupling_scores if s < 0.3]),
                "medium": len([s for s in coupling_scores if 0.3 <= s < 0.7]),
                "high": len([s for s in coupling_scores if s >= 0.7])
            }
        }

    def _generate_visual_graph(self, graph_data: Dict[str, Any]) -> None:
        """إنتاج مخطط بصري للتبعيات"""
        try:
            import matplotlib.pyplot as plt
            import networkx as nx

            # إنشاء الرسم البياني
            G = nx.DiGraph()

            # إضافة العقد
            for module_name in graph_data["modules"].keys():
                G.add_node(module_name)

            # إضافة الحواف
            for dep in graph_data["dependencies"]:
                G.add_edge(dep["from"], dep["to"])

            # رسم المخطط
            plt.figure(figsize=(15, 10))
            pos = nx.spring_layout(G, k=1, iterations=50)

            # رسم العقد
            nx.draw_networkx_nodes(G, pos, node_color='lightblue',
                                 node_size=1000, alpha=0.7)

            # رسم الحواف
            nx.draw_networkx_edges(G, pos, edge_color='gray',
                                 arrows=True, arrowsize=20)

            # إضافة التسميات
            nx.draw_networkx_labels(G, pos, font_size=8)

            plt.title("خريطة التبعيات", fontsize=16)
            plt.axis('off')
            plt.tight_layout()

            # حفظ المخطط
            output_path = self.output_dir / "artifacts/assemble/dependency_graph.png"
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            plt.close()

            self.logger.info(f"✅ تم حفظ المخطط البصري: {output_path}")

        except ImportError:
            self.logger.warning("⚠️ matplotlib أو networkx غير متوفر لإنتاج المخططات البصرية")
        except Exception as e:
            self.logger.error(f"❌ خطأ في إنتاج المخطط البصري: {e}")

    def analyze_api_interfaces(self) -> Dict[str, Any]:
        """تحليل واجهات API"""
        self.logger.info("🔌 تحليل واجهات API...")

        apis = {
            "rest_endpoints": [],
            "graphql_schemas": [],
            "grpc_services": [],
            "openapi_specs": []
        }

        # البحث عن ملفات OpenAPI/Swagger
        openapi_files = list(self.repo_path.rglob("*openapi*.yml")) + \
                       list(self.repo_path.rglob("*swagger*.yml")) + \
                       list(self.repo_path.rglob("*openapi*.yaml")) + \
                       list(self.repo_path.rglob("*swagger*.yaml"))

        for api_file in openapi_files:
            try:
                with open(api_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    apis["openapi_specs"].append({
                        "file": str(api_file.relative_to(self.repo_path)),
                        "size": len(content),
                        "endpoints_count": content.count("paths:")
                    })
            except Exception as e:
                self.logger.warning(f"⚠️ تعذر قراءة {api_file}: {e}")

        # البحث عن ملفات GraphQL
        graphql_files = list(self.repo_path.rglob("*.graphql")) + \
                       list(self.repo_path.rglob("*.gql"))

        for gql_file in graphql_files:
            try:
                with open(gql_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    apis["graphql_schemas"].append({
                        "file": str(gql_file.relative_to(self.repo_path)),
                        "size": len(content),
                        "types_count": content.count("type "),
                        "queries_count": content.count("Query"),
                        "mutations_count": content.count("Mutation")
                    })
            except Exception as e:
                self.logger.warning(f"⚠️ تعذر قراءة {gql_file}: {e}")

        # البحث عن ملفات Proto (gRPC)
        proto_files = list(self.repo_path.rglob("*.proto"))

        for proto_file in proto_files:
            try:
                with open(proto_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    apis["grpc_services"].append({
                        "file": str(proto_file.relative_to(self.repo_path)),
                        "size": len(content),
                        "services_count": content.count("service "),
                        "messages_count": content.count("message ")
                    })
            except Exception as e:
                self.logger.warning(f"⚠️ تعذر قراءة {proto_file}: {e}")

        # كشف REST endpoints من الكود
        rest_endpoints = self._extract_rest_endpoints()
        apis["rest_endpoints"] = rest_endpoints

        # حفظ تحليل APIs
        with open(self.output_dir / "artifacts/assemble/api_analysis.json", "w") as f:
            json.dump(apis, f, indent=2, ensure_ascii=False)

        return apis

    def _extract_rest_endpoints(self) -> List[Dict[str, Any]]:
        """استخراج REST endpoints من الكود"""
        endpoints = []

        # أنماط شائعة لـ REST endpoints
        patterns = [
            r'@app\.route\(["\']([^"\']+)["\'].*methods=\[([^\]]+)\]',  # Flask
            r'@RequestMapping\(["\']([^"\']+)["\'].*method\s*=\s*RequestMethod\.(\w+)',  # Spring
            r'router\.(get|post|put|delete|patch)\(["\']([^"\']+)["\']',  # Express.js
            r'@(GET|POST|PUT|DELETE|PATCH)\(["\']([^"\']+)["\']',  # JAX-RS
        ]

        # فحص ملفات الكود
        for code_file in self.repo_path.rglob("*"):
            if code_file.suffix in ['.py', '.java', '.js', '.ts', '.kt']:
                try:
                    with open(code_file, 'r', encoding='utf-8') as f:
                        content = f.read()

                        for pattern in patterns:
                            matches = re.finditer(pattern, content, re.IGNORECASE)
                            for match in matches:
                                if len(match.groups()) >= 2:
                                    path = match.group(1) if match.group(1).startswith('/') else match.group(2)
                                    method = match.group(2) if match.group(1).startswith('/') else match.group(1)

                                    endpoints.append({
                                        "path": path,
                                        "method": method.upper(),
                                        "file": str(code_file.relative_to(self.repo_path)),
                                        "line": content[:match.start()].count('\n') + 1
                                    })

                except (UnicodeDecodeError, Exception):
                    continue

        return endpoints

def main():
    """الدالة الرئيسية"""
    import sys

    if len(sys.argv) < 3:
        print("الاستخدام: python assemble_architecture.py <repo_path> <output_dir>")
        sys.exit(1)

    repo_path = sys.argv[1]
    output_dir = sys.argv[2]

    mapper = ArchitectureMapper(repo_path, output_dir)

    # تشغيل التحليل
    mapper.generate_dependency_graph()
    mapper.analyze_api_interfaces()

    print("✅ تمت مرحلة التجميع بنجاح")

if __name__ == "__main__":
    main()