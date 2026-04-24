import matplotlib.pyplot as plt
import os

# Настройка для классического вида LaTeX и корректной кириллицы
plt.rcParams.update({
    "font.family": "serif",        # Используем шрифт с засечками (как в LaTeX)
    "font.serif": ["STIXGeneral", "DejaVu Serif"], # STIX для математики, DejaVu для подстраховки кириллицы
    "mathtext.fontset": "stix",    # Математика в стиле STIX (максимально близко к Computer Modern)
})

def create_single_equation_image(global_index, condition, equation, filename):
    # Увеличиваем DPI для четкости формул
    fig, ax = plt.subplots(figsize=(3.5, 2), dpi=200)
    
    fig.patch.set_facecolor('white')
    ax.set_facecolor('white')
    ax.axis('off')
    
    # Условие (текст с переносом)
    ax.text(0.5, 0.75, condition,
            fontsize=9, weight='bold', ha='center', va='center',
            transform=ax.transAxes, wrap=True)
    
    # Очищаем уравнение от лишних пробелов по краям
    equation = equation.strip()
    
    # Динамический размер шрифта для формулы
    clean_len = len(equation.replace('$', ''))
    if clean_len < 35:
        fs = 13
    elif clean_len < 65:
        fs = 11
    else:
        fs = 9
    
    # Формула (БЕЗ wrap=True, чтобы не ломать LaTeX-синтаксис)
    ax.text(0.5, 0.35, equation,
            fontsize=fs, ha='center', va='center',
            transform=ax.transAxes)
    
    # Сохраняем. Убрал bbox_inches='tight', чтобы все карточки были строго 3.5x2
    plt.savefig(filename, dpi=300, facecolor='white')
    plt.close()
    print(f"Создано: {filename}")

if not os.path.exists('equations'):
    os.makedirs('equations')

tasks_data = [
    {
        "condition": "Вычислить предел (округлить до 3 знаков после запятой):",
        "equations": [
            r"$\lim_{x \to \frac{\pi}{4}} (\tan x)^{\tan 2x}$", # 1
            r"$\lim_{x \to \frac{\pi}{2}} (\sin x)^{\tan x}$", # 2
            r"$\lim_{x \to 0} [\tan(\frac{\pi}{4} - x)]^{\cot x}$", # 3
            r"$\lim_{x \to \infty} (\sin \frac{1}{x} + \cos \frac{1}{x})^x$", # 4
            r"$\lim_{x \to 0} \sqrt[x]{\cos \sqrt{x}}$", # 5
            r"$\lim_{x \to 0} \frac{\ln(1+x)}{x}$", # 6
            r"$\lim_{x \to +\infty} x[\ln(x+1) - \ln x]$", # 7
            r"$\lim_{x \to +\infty} [\sin \ln(x+1) - \sin \ln x]$", # 8
            r"$\lim_{x \to +\infty} \frac{\ln(x^2 - x + 1)}{\ln(x^{10} + x + 1)}$", # 9
            r"$\lim_{x \to \infty} \log_{10}(\frac{100 + x^2}{1 + 100x^2})$", # 10
            r"$\lim_{x \to +\infty} \frac{\ln(2 + e^{3x})}{\ln(3 + e^{2x})}$", # 11
            r"$\lim_{x \to +\infty} \frac{\ln(1 + x + e^x)}{\ln(1 + x^2 + e^{2x})}$", # 12
            r"$\lim_{x \to 0} (x + e^x)^{1/x}$", # 13
            r"$\lim_{x \to 0} (\frac{1 + x \cdot 2^x}{1 + x \cdot 3^x})^{1/x^2}$", # 14
            r"$\lim_{x \to 1} \frac{\sin^2(\pi \cdot 2^x)}{\ln[\cos(\pi \cdot 2^x)]}$", # 15
            r"$\lim_{n \to \infty} \tan^n(\frac{\pi}{4} + \frac{1}{n})$", # 16
            r"$\lim_{x \to 0} \frac{\ln(x^2 + e^x)}{\ln(x^4 + e^{2x})}$", # 17
            r"$\lim_{x \to +\infty} \frac{\ln(x^2 + e^x)}{\ln(x^4 + e^{2x})}$", # 18
            r"$\lim_{x \to 0} \frac{\ln(1 + x e^x)}{\ln(x + \sqrt{1 + x^2})}$", # 19
            r"$\lim_{x \to +\infty} [(x+2)\ln(x+2) - 2(x+1)\ln(x+1) + x\ln x]$", # 20
            r"$\lim_{x \to +\infty} (\ln \frac{x + \sqrt{x^2+1}}{x + \sqrt{x^2-1}} \cdot \ln^{-2} \frac{x+1}{x-1})$", # 21
            r"$\lim_{x \to 0} \frac{\sqrt{1 + x \sin x} - 1}{e^{x^2} - 1}$", # 22
            r"$\lim_{x \to 0} \frac{\cos(x e^x) - \cos(x e^{-x})}{x^3}$", # 23
            r"$\lim_{x \to 0} (2e^{\frac{x}{x+1}} - 1)^{\frac{x+1}{x}}$", # 24
            r"$\lim_{x \to 1} (2-x)^{\sec \frac{\pi x}{2}}$", # 25
            r"$\lim_{x \to 0} \frac{\text{sh } x}{x}$", # 26
            r"$\lim_{x \to 0} \frac{\text{ch } x - 1}{x^2}$", # 27
            r"$\lim_{x \to 0} \frac{\text{th } x}{x}$", # 28
            r"$\lim_{x \to 0} \frac{\text{sh}^2 x}{\ln(\text{ch } 3x)}$", # 29
            r"$\lim_{x \to +\infty} \frac{\text{sh} \sqrt{x^2+x} - \text{sh} \sqrt{x^2-x}}{\text{ch } x}$", # 30
            r"$\lim_{x \to +\infty} (x - \ln \text{ch } x)$", # 31
            r"$\lim_{x \to 0} \frac{e^{\text{sh } 2x} - e^{\text{sh } x}}{\text{th } x}$", # 32
            r"$\lim_{n \to \infty} (\frac{\text{ch } \frac{\pi}{n}}{\cos \frac{\pi}{n}})^{n^2}$", # 33
            r"$\lim_{x \to \infty} \arcsin \frac{1 - x}{1 + x}$", # 34
            r"$\lim_{x \to +\infty} \arccos(\sqrt{x^2+x} - x)$", # 35
            r"$\lim_{x \to 2} \text{arctg } \frac{x-4}{(x-2)^2}$", # 36
            r"$\lim_{x \to -\infty} \text{arcctg } \frac{x}{\sqrt{1 + x^2}}$", # 37
            r"$\lim_{x \to \frac{\pi}{3}} \frac{\sin(x - \frac{\pi}{3})}{1 - 2 \cos x}$", # 38
            r"$\lim_{x \to \frac{\pi}{6}} \frac{\tan^3 x - 3 \tan x}{\cos(x + \frac{\pi}{6})}$", # 39
            r"$\lim_{x \to \frac{\pi}{4}} \frac{1 - \cot^3 x}{2 - \cot x - \cot^3 x}$", # 40
            r"$\lim_{x \to 0} \frac{\sqrt{1 + \tan x} - \sqrt{1 + \sin x}}{x^3}$", # 41
            r"$\lim_{x \to 0} \frac{x^2}{\sqrt{1 + x \sin x} - \sqrt{\cos x}}$", # 42
            r"$\lim_{x \to 0} \frac{\sqrt{\cos x} - \sqrt[3]{\cos x}}{\sin^2 x}$", # 43
            r"$\lim_{x \to 0} \frac{\sqrt{1 - \cos x^2}}{1 - \cos x}$", # 44
            r"$\lim_{x \to 0} \frac{1 - \sqrt{\cos x}}{1 - \cos \sqrt{x}}$", # 45
            r"$\lim_{x \to 0} \frac{1 - \cos x \sqrt{\cos 2x} \sqrt{\cos 3x}}{x^2}$", # 46
            r"$\lim_{x \to +\infty} (\sin \sqrt{x+1} - \sin \sqrt{x})$", # 47
            r"$\lim_{x \to \infty} (\frac{x+2}{2x-1})^{x^2}$", # 48
            r"$\lim_{x \to \infty} (\frac{x^2-1}{x^2+1})^{\frac{x-1}{x+1}}$", # 49
            r"$\lim_{x \to \infty} (\frac{x^2+1}{x^2-2})^{x^2}$" # 50
        ]
    },
    {
        "condition": "Найти значение производной в точке (округлить до 3 знаков):",
        "equations": [
                r"$y = 2^{\tan(1/x)}, \text{ при } x=1/\pi$", # 51 (155)
                r"$y = 3\cos 2x - \sqrt{1-\sin 2x}(\sin x + \cos x), \text{ при } x=\pi/6$", # 52 (156)
                r"$y = \log_{1/2}(x-1/2)^2 + \log_2 \sqrt{4x^2-4x+1}, \text{ при } x=0$", # 53 (157)
                r"$y = \sqrt{\ln x}(\ln x - \log_{ex} x)\sqrt{\ln x + \log_x e + 2}, \text{ при } x=e$", # 54 (158)
                r"$y = \ln(1+\sin^2 x) - 2\sin x \cdot \arctan \sin x, \text{ при } x=\pi/2$", # 55 (159)
                r"$y = \arcsin\frac{2x}{1+x^2}, \text{ при } x=0$", # 56 (160)
                r"$y = \arcsin\frac{2x}{1+x^2}, \text{ при } x=2$", # 57 (160)
                r"$y = \arcsin\frac{1-x^2}{1+x^2}, \text{ при } x=-1$", # 58 (161)
                r"$y = \arcsin\frac{1-x^2}{1+x^2}, \text{ при } x=1$", # 59 (161)
                r"$y = \arcsin\frac{1-x^2}{1+x^2}, \text{ при } x=0.5$", # 60 (161)
                r"$y = \ln \frac{x^4-x^2+1}{x^4+2x^2+1} + 2\sqrt{3}\arctan \frac{\sqrt{3}}{1-2x^2}, \text{ при } x=1$", # 61 (162)
                r"$y = \sqrt[3]{\arctan \sqrt[5]{\cos \ln^3 x}}, \text{ при } x=1$", # 62 (163)
                r"$y = (\cosh x)^{\sinh x}, \text{ при } x=0$", # 63 (164)
                r"$y = (\sqrt{1+3^x})^{\ln x^2}, \text{ при } x=1$", # 64 (165)
                r"$y = (\frac{\sin x}{x})^x, \text{ при } x=\pi/2$", # 65 (166)
                r"$y = e^{x^2}, \text{ при } x=1$", # 66
                r"$y = \ln(x^2+1), \text{ при } x=1$", # 67
                r"$y = x \ln x, \text{ при } x=e$", # 68
                r"$y = \frac{1}{x}, \text{ при } x=2$", # 69
                r"$y = \sqrt{x}, \text{ при } x=4$", # 70
                r"$y = \sin^2 x, \text{ при } x=\pi/4$", # 71
                r"$y = \arctan x, \text{ при } x=1$", # 72
                r"$y = 2^x, \text{ при } x=0$", # 73
                r"$y = \cos(x^2), \text{ при } x=\sqrt{\pi/2}$", # 74
                r"$y = \frac{x+1}{x-1}, \text{ при } x=2$", # 75
                r"$y = \ln(\sin x), \text{ при } x=\pi/4$", # 76
                r"$y = \sinh x, \text{ при } x=0$", # 77
                r"$y = \arcsin x, \text{ при } x=0$", # 78
                r"$y = e^{-x}, \text{ при } x=0$", # 79
                r"$y = \tan x, \text{ при } x=0$", # 80
                r"$y = \sqrt{1-x^2}, \text{ при } x=0.6$", # 81
                r"$y = \frac{e^x}{x}, \text{ при } x=1$", # 82
                r"$y = x^3 - 3x^2 + 2, \text{ при } x=2$", # 83
                r"$y = \ln(1+e^x), \text{ при } x=0$", # 84
                r"$y = \cos^3 x, \text{ при } x=\pi/3$", # 85
                r"$y = \sqrt{x} + \frac{1}{\sqrt{x}}, \text{ при } x=1$", # 86
                r"$y = \text{ctg } x, \text{ при } x=\pi/4$", # 87
                r"$y = 10^x, \text{ при } x=1$", # 88
                r"$y = x^x, \text{ при } x=1$", # 89
                r"$y = \ln(x + \sqrt{x^2+1}), \text{ при } x=0$", # 90
                r"$y = \sin(2x), \text{ при } x=\pi/6$", # 91
                r"$y = \frac{\ln x}{x}, \text{ при } x=e$", # 92
                r"$y = \sqrt[3]{x}, \text{ при } x=1$", # 93
                r"$y = 5\sin x - 3\cos x, \text{ при } x=0$", # 94
                r"$y = e^{\sin x}, \text{ при } x=0$", # 95
                r"$y = \arccos x, \text{ при } x=0$", # 96
                r"$y = \frac{1}{1+x^2}, \text{ при } x=1$", # 97
                r"$y = \text{sh } 2x, \text{ при } x=0$", # 98
                r"$y = e^{\arctan x}, \text{ при } x=0$", # 99
                r"$y = \frac{\sin x}{1+\cos x}, \text{ при } x=0$" # 100
        ]
    },
    {
        "condition": "Вычислить определенный интеграл (округлить до 3 знаков):",
        "equations": [
            r"$\int_{-\pi}^{\pi} \sqrt[3]{\sin x} \, dx$", # 101 (127)
            r"$\int_{-\pi}^{\pi} e^{x^2} \sin x \, dx$", # 102 (128)
            r"$\int_{-\pi/2}^{\pi/2} (\cos^2 x + x^2 \sin x) \, dx$", # 103 (129)
            r"$\int_{-1}^{1} \cos x \cdot \tanh x \, dx$", # 104 (130)
            r"$\int_{-1}^{1} (e^x + e^{-x}) \tan x \, dx$", # 105 (131)
            r"$\int_{-\pi/3}^{\pi/3} (x^2 \sin 5x + \cos \frac{x}{3} + \tan^3 x) \, dx$", # 106 (132)
            r"$\int_{-\pi/3}^{\pi/3} \frac{2x^7 - x^5 + 2x^3 - x + 1}{\cos^2 x} \, dx$", # 107 (133)
            r"$\int_0^1 x^2 \sqrt{1-x^2} \, dx$", # 108 (135)
            r"$\int_0^{\ln 2} \sqrt{e^x - 1} \, dx$", # 109 (136)
            r"$\int_0^{\ln 2} x e^{-x} \, dx$", # 110 (137)
            r"$\int_0^\pi x \sin x \, dx$", # 111 (138)
            r"$\int_0^{\pi/4} x \sin 2x \, dx$", # 112 (139)
            r"$\int_0^{2\pi} x^2 \cos x \, dx$", # 113 (140)
            r"$\int_0^1 \arccos x \, dx$", # 114 (141)
            r"$\int_0^3 \arctan \sqrt{x} \, dx$", # 115 (142)
            r"$\int_1^e \frac{dx}{x \sqrt{1+\ln x}}$", # 116 (143)
            r"$\int_0^1 \frac{e^{2x}+2e^x}{e^{2x}+1} \, dx$", # 117 (144)
            r"$\int_0^{\pi/2} \frac{dx}{2-\sin x}$", # 118 (145)
            r"$\int_{\pi/3}^{\pi/2} \frac{dx}{3+\cos x}$", # 119 (146)
            r"$\int_0^{3/4} \frac{dx}{(x+1)\sqrt{x^2+1}}$", # 120 (147)
            r"$\int_{-3}^{-2} \frac{dx}{x\sqrt{x^2-1}}$", # 121 (149)
            r"$\int_0^1 x^{15} \sqrt{1+3x^8} \, dx$", # 122 (150)
            r"$\int_0^{\pi/2} \sin x \sin 2x \sin 3x \, dx$", # 123 (151)
            r"$\int_0^{\ln 2} \sinh^4 x \, dx$", # 124 (152)
            r"$\int_1^2 x^2 \ln x \, dx$", # 125 (153)
            r"$\int_1^e x^2 \ln x \, dx$", # 126 (154, n=2)
            r"$\int_0^{\sqrt{3}} x \arctan x \, dx$", # 127 (155)
            r"$\int_0^1 x(2-x^2)^{12} \, dx$", # 128 (156)
            r"$\int_0^1 \arcsin \sqrt{x} \, dx$", # 129 (157)
            r"$\int_0^\pi e^x \cos^2 x \, dx$", # 130 (158)
            r"$\int_{1/e}^e |\ln x| \, dx$", # 131 (159)
            r"$\int_0^e (x \ln x)^2 \, dx$", # 132 (160)
            r"$\int_0^3 \arcsin \sqrt{\frac{x}{1+x}} \, dx$", # 133 (161)
            r"$\int_1^2 \frac{\sqrt{x^2-1}}{x^4} \, dx$", # 134 (162, a=1)
            r"$\int_{-1}^1 \frac{x \, dx}{x^2+x+1}$", # 135 (163)
            r"$\int_0^1 \frac{\ln(1+x)}{1+x^2} \, dx$", # 136 (164)
            r"$\int_0^\pi \frac{dx}{2+\cos x}$", # 137 (165, a=2, b=1)
            r"$\int_0^1 x e^x \, dx$", # 138
            r"$\int_0^2 (3x^2+1) \, dx$", # 139
            r"$\int_1^2 \frac{dx}{x}$", # 140
            r"$\int_0^1 \frac{dx}{1+x^2}$", # 141
            r"$\int_0^\pi \sin x \, dx$", # 142
            r"$\int_0^{\pi/2} \cos x \, dx$", # 143
            r"$\int_0^1 e^x \, dx$", # 144
            r"$\int_1^4 \sqrt{x} \, dx$", # 145
            r"$\int_0^1 (x^3+x) \, dx$", # 146
            r"$\int_{-1}^1 x^2 \, dx$", # 147
            r"$\int_0^2 \frac{dx}{x+1}$", # 148
            r"$\int_0^1 (1-x)^5 \, dx$", # 149
            r"$\int_0^{\pi/4} \sec^2 x \, dx$" # 150
        ]
    }
]

global_index = 1
for task_group in tasks_data:
    cond = task_group["condition"]
    for eq in task_group["equations"]:
        filename = f"{global_index}.png"
        create_single_equation_image(global_index, cond, eq, filename)
        global_index += 1

'''
    "condition": "Найти значение производной в точке (округлить до 3 знаков):",
    "education": [
            r"$y = 2^{\tan(1/x)}, \text{ при } x=1/\pi$", # 54 (155)
            r"$y = 3\cos 2x - \sqrt{1-\sin 2x}(\sin x + \cos x), \text{ при } x=\pi/6$", # 55 (156)
            r"$y = \log_{1/2}(x-1/2)^2 + \log_2 \sqrt{4x^2-4x+1}, \text{ при } x=0$", # 56 (157)
            r"$y = \sqrt{\ln x}(\ln x - \log_{ex} x)\sqrt{\ln x + \log_x e + 2}, \text{ при } x=e$", # 57 (158)
            r"$y = \ln(1+\sin^2 x) - 2\sin x \cdot \arctan \sin x, \text{ при } x=\pi/2$", # 58 (159)
            r"$y = \arcsin\frac{2x}{1+x^2}, \text{ при } x=0$", # 59 (160)
            r"$y = \arcsin\frac{2x}{1+x^2}, \text{ при } x=2$", # 60 (160)
            r"$y = \arcsin\frac{1-x^2}{1+x^2}, \text{ при } x=-1$", # 61 (161)
            r"$y = \arcsin\frac{1-x^2}{1+x^2}, \text{ при } x=1$", # 62 (161)
            r"$y = \arcsin\frac{1-x^2}{1+x^2}, \text{ при } x=0.5$", # 63 (161)
            r"$y = \ln \frac{x^4-x^2+1}{x^4+2x^2+1} + 2\sqrt{3}\arctan \frac{\sqrt{3}}{1-2x^2}, \text{ при } x=1$", # 64 (162)
            r"$y = \sqrt[3]{\arctan \sqrt[5]{\cos \ln^3 x}}, \text{ при } x=1$", # 65 (163)
            r"$y = (\cosh x)^{\sinh x}, \text{ при } x=0$", # 66 (164)
            r"$y = (\sqrt{1+3^x})^{\ln x^2}, \text{ при } x=1$", # 67 (165)
            r"$y = (\frac{\sin x}{x})^x, \text{ при } x=\pi/2$", # 68 (166)
            r"$y = e^{x^2}, \text{ при } x=1$", # 69
            r"$y = \ln(x^2+1), \text{ при } x=1$", # 70
            r"$y = x \ln x, \text{ при } x=e$", # 71
            r"$y = \frac{1}{x}, \text{ при } x=2$", # 72
            r"$y = \sqrt{x}, \text{ при } x=4$", # 73
            r"$y = \sin^2 x, \text{ при } x=\pi/4$", # 74
            r"$y = \arctan x, \text{ при } x=1$", # 75
            r"$y = 2^x, \text{ при } x=0$", # 76
            r"$y = \cos(x^2), \text{ при } x=\sqrt{\pi/2}$", # 77
            r"$y = \frac{x+1}{x-1}, \text{ при } x=2$", # 78
            r"$y = \ln(\sin x), \text{ при } x=\pi/4$", # 79
            r"$y = \sinh x, \text{ при } x=0$", # 80
            r"$y = \arcsin x, \text{ при } x=0$", # 81
            r"$y = e^{-x}, \text{ при } x=0$", # 82
            r"$y = \tan x, \text{ при } x=0$", # 83
            r"$y = \sqrt{1-x^2}, \text{ при } x=0.6$", # 84
            r"$y = \frac{e^x}{x}, \text{ при } x=1$", # 85
            r"$y = x^3 - 3x^2 + 2, \text{ при } x=2$", # 86
            r"$y = \ln(1+e^x), \text{ при } x=0$", # 87
            r"$y = \cos^3 x, \text{ при } x=\pi/3$", # 88
            r"$y = \sqrt{x} + \frac{1}{\sqrt{x}}, \text{ при } x=1$", # 89
            r"$y = \text{ctg } x, \text{ при } x=\pi/4$", # 90
            r"$y = 10^x, \text{ при } x=1$", # 91
            r"$y = x^x, \text{ при } x=1$", # 92
            r"$y = \ln(x + \sqrt{x^2+1}), \text{ при } x=0$", # 93
            r"$y = \sin(2x), \text{ при } x=\pi/6$", # 94
            r"$y = \frac{\ln x}{x}, \text{ при } x=e$", # 95
            r"$y = \sqrt[3]{x}, \text{ при } x=1$", # 96
            r"$y = 5\sin x - 3\cos x, \text{ при } x=0$", # 97
            r"$y = e^{\sin x}, \text{ при } x=0$", # 98
            r"$y = \arccos x, \text{ при } x=0$", # 99
            r"$y = \frac{1}{1+x^2}, \text{ при } x=1$" # 100
            r"$y = \text{sh } 2x, \text{ при } x=0$", # 90
            r"$y = e^{\arctan x}, \text{ при } x=0$", # 91
            r"$y = \frac{\sin x}{1+\cos x}, \text{ при } x=0$", # 92
            r"$y = x \ln^2 x, \text{ при } x=e$", # 93
            r"$y = \sqrt{x + \sqrt{x}}, \text{ при } x=1$", # 94
            r"$y = \arccos(1-2x), \text{ при } x=0.5$", # 95
            r"$y = \frac{e^x-e^{-x}}{2}, \text{ при } x=0$", # 96
            r"$y = \sin^4 x - \cos^4 x, \text{ при } x=\pi/8$", # 97
            r"$y = \ln \sqrt{1+x^2}, \text{ при } x=1$", # 98
            r"$y = x^2 \sin(1/x), \text{ при } x=1/\pi$", # 99
            r"$y = \sqrt{x^2+16}, \text{ при } x=3$" # 100
        ]


'''