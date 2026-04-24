import matplotlib.pyplot as plt
import os
import re
import textwrap

# Настройка шрифтов
plt.rcParams.update({
    "font.family": "serif",
    "font.serif": ["DejaVu Serif"],
    "mathtext.fontset": "dejavuserif",
    "axes.unicode_minus": False,
})

def wrap_text_preserve_latex(text, width):
    """
    Обёртывает текст, не разрывая блоки $...$.
    width — максимальная длина строки в символах.
    """
    parts = re.split(r'(\$[^\$]*\$)', text)
    lines = []
    current_line = ''
    for part in parts:
        if part.startswith('$') and part.endswith('$'):
            # Латексный блок — добавляем целиком
            if not current_line:
                current_line = part
            else:
                test_line = current_line + ' ' + part
                if len(test_line) <= width:
                    current_line = test_line
                else:
                    lines.append(current_line)
                    current_line = part
        else:
            # Обычный текст — разбиваем с помощью textwrap
            if current_line:
                part = current_line + ' ' + part
                current_line = ''
            wrapped = textwrap.wrap(part, width, break_long_words=False, replace_whitespace=False)
            if not wrapped:
                continue
            for i, wline in enumerate(wrapped):
                if i < len(wrapped) - 1:
                    lines.append(wline)
                else:
                    current_line = wline
    if current_line:
        lines.append(current_line)
    return lines

def create_single_equation_image(global_index, condition, equation, filename):
    fig, ax = plt.subplots(figsize=(3.5, 2), dpi=200)
    fig.patch.set_facecolor('white')
    ax.set_facecolor('white')
    ax.axis('off')

    # Перенос условия (ширина строки подобрана для шрифта 9)
    max_chars = 55
    wrapped_lines = wrap_text_preserve_latex(condition, max_chars)
    wrapped_text = '\n'.join(wrapped_lines)

    # Условие
    ax.text(0.5, 0.75, wrapped_text,
            fontsize=6, weight='bold', ha='center', va='center',
            transform=ax.transAxes, wrap=False)

    # Уравнение
    eq = equation.strip()
    if not (eq.startswith('$') and eq.endswith('$')):
        eq = f"${eq}$"

    clean_len = len(eq.replace('$', '').replace('\\', ''))
    if clean_len < 35:
        fs = 6
    elif clean_len < 65:
        fs = 6
    else:
        fs = 6

    ax.text(0.5, 0.35, eq,
            fontsize=fs, ha='center', va='center',
            transform=ax.transAxes)

    plt.savefig(filename, dpi=300, facecolor='white')
    plt.close()
    print(f"Создано: {filename}")

if not os.path.exists('equations'):
    os.makedirs('equations')

tasks_data = [
    {
        "condition": "Тонкий однородный стержень длиной $L$ и массой $M$ вращается вокруг оси, проходящей через его центр перпендикулярно стержню. Момент инерции стержня относительно этой оси представляется в виде $I = k M L^2$. Определите числовое значение коэффициента $k$.",
        "equations": ["$I = k \\cdot M L^2$"]
    },
    {
        "condition": "Тонкий однородный стержень длиной $L$ и массой $M$ вращается вокруг оси, проходящей через один из его концов перпендикулярно стержню. Момент инерции стержня относительно этой оси имеет вид $I = k M L^2$. Найдите коэффициент $k$.",
        "equations": ["$I = k \\cdot M L^2$"]
    },
    {
        "condition": "Однородный шар массой $M$ и радиусом $R$ вращается вокруг оси, проходящей через его центр. Момент инерции шара выражается как $I = k M R^2$. Найдите коэффициент $k$.",
        "equations": ["$I = k \\cdot M R^2$"]
    },
    {
        "condition": "Шар радиуса $R$ равномерно заряжен по объёму с плотностью $\\rho$. На расстоянии $r$ от центра ($r ≤ R$) напряжённость поля равна $E = k \\cdot \\frac{\\rho r}{\\varepsilon_0}$. Определите коэффициент $k$.",
        "equations": ["$E = k \\cdot \\frac{\\rho r}{\\varepsilon_0}$"]
    },
    {
        "condition": "Сплошной однородный цилиндр массой $m$ катится без проскальзывания со скоростью $v$ центра масс. Его полная кинетическая энергия равна $T = k \\cdot \\frac{m v^2}{2}$. Найдите коэффициент $k$.",
        "equations": ["$T = k \\cdot \\frac{m v^2}{2}$"]
    },
    {
        "condition": "Бесконечная плоскость заряжена с поверхностной плотностью $\\sigma$. Напряжённость электрического поля вблизи плоскости выражается как $E = k \\cdot \\frac{\\sigma}{\\varepsilon_0}$. Найдите числовое значение коэффициента $k$.",
        "equations": ["$E = k \\cdot \\frac{\\sigma}{\\varepsilon_0}$"]
    },
    {
        "condition": "Для одноатомного идеального газа давление связано со средней кинетической энергией поступательного движения молекулы $\\langle E_k \\rangle$ и концентрацией $n$ формулой $p = k \\cdot n \\langle E_k \\rangle$. Определите коэффициент $k$.",
        "equations": ["$p = k \\cdot n \\langle E_k \\rangle$"]
    },
    {
        "condition": "Длинный соленоид имеет $n$ витков на единицу длины. При силе тока $I$ индукция магнитного поля внутри соленоида равна $B = k \\cdot \\mu_0 n I$. Найдите коэффициент $k$.",
        "equations": ["$B = k \\cdot \\mu_0 n I$"]
    },
    {
        "condition": "Однородный стержень длиной $L$ и площадью поперечного сечения $S$ изготовлен из материала с модулем Юнга $E$. При растяжении силой $F$ его удлинение $\\Delta L$. Потенциальная энергия деформации стержня может быть записана как $W = k \\cdot \\frac{F^2 L}{E S}$. Определите коэффициент $k$.",
        "equations": ["$W = k \\cdot \\frac{F^2 L}{E S}$"]
    },
    {
        "condition": "Плоский конденсатор с площадью пластин $S$ и расстоянием между ними $d$ заполнен диэлектриком с проницаемостью $\\varepsilon$. При напряжении $U$ энергия поля конденсатора равна $W = k \\cdot \\frac{\\varepsilon \\varepsilon_0 S U^2}{d}$. Найдите коэффициент $k$.",
        "equations": ["$W = k \\cdot \\frac{\\varepsilon \\varepsilon_0 S U^2}{d}$"]
    },
    {
        "condition": "Частица с зарядом $q$ и массой $m$ влетает со скоростью $v$ перпендикулярно однородному магнитному полю индукции $B$. Радиус окружности, по которой движется частица, даётся формулой $R = k \\cdot \\frac{m v}{q B}$. Определите коэффициент $k$.",
        "equations": ["$R = k \\cdot \\frac{m v}{q B}$"]
    },
    {
        "condition": "Энергия фотона с длиной волны $\\lambda$ в вакууме выражается как $E = k \\cdot \\frac{h c}{\\lambda}$, где $h$ — постоянная Планка, $c$ — скорость света. Найдите коэффициент $k$.",
        "equations": ["$E = k \\cdot \\frac{h c}{\\lambda}$"]
    }
]

global_index = 1
for task_group in tasks_data:
    cond = task_group["condition"]
    for eq in task_group["equations"]:
        filename = f"{global_index}.png"
        create_single_equation_image(global_index, cond, eq, filename)
        global_index += 1