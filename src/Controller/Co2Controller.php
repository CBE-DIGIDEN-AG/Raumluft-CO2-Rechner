<?php
namespace App\Controller;

use EasyCorp\Bundle\EasyAdminBundle\Config\Asset;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\Console\Helper\DebugFormatterHelper;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use App\Entity\Page;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Dompdf\Dompdf;
use Dompdf\Options;
use App\Service\ManifestService;

class Co2Controller extends AbstractController
{
    private $manifestService;

    #[Route('/')]
    public function co2app(): Response
    {
        return $this->render('base.html.twig', [
        ]);
    }

    #[Route('/ajaxpage', methods: ['GET'])]
    public function ajaxpage(Request $request, EntityManagerInterface $entityManager, ManifestService $manifestService): Response
    {
        $this->manifestService = $manifestService;
        $pages = $entityManager->getRepository(Page::class)->findBySlug($request->get('page'));
        if ($pages) {
            $page = current($pages);

            $content = $this->renderVideos($page->getContent());

            return new JsonResponse([
                'slug' => $page->getSlug(),
                'title'  => $page->getTitle(),
                'content' => $content
            ]);
        }

        die('404');
    }

    protected function renderVideos(string $content): string
    {
        return preg_replace_callback(
            '/\[video\s+([^\]]+)\]/i',
            function ($matches) {

                // Attribute parsen
                preg_match_all('/(\w+)="([^"]*)"/', $matches[1], $attrs);

                $attributes = array_combine($attrs[1], $attrs[2]);

                $src = $this->manifestService->get($attributes['src']) ?? '';
                $poster = $this->manifestService->get($attributes['poster']) ?? '';
                $subtitles = $this->manifestService->get($attributes['subtitles']) ?? '';

                if (!$src) {
                    return '';
                }

                $html = '<video playsinline controls';

                if ($poster) {
                    $html .= ' poster="' . htmlspecialchars($poster) . '"';
                }

                $html .= '>';

                $html .= '<source src="' . htmlspecialchars($src) . '" type="video/mp4">';

                if ($subtitles) {
                    $html .= '<track src="' . htmlspecialchars($subtitles) . '" kind="subtitles" srclang="de" label="Deutsch" default>';
                }

                $html .= 'Dein Browser unterstützt das Video-Tag nicht.</video>';

                return $html;
            },
            $content
        );
    }

    #[Route('/export', methods: ['POST'])]
    public function export(Request $request, ManifestService $manifestService): Response
    {
        $type = $request->get('exportaction');
        $this->manifestService = $manifestService;

        switch($type) {
            case 'excel':
                $aExportData = json_decode($request->get('exportdata'));
                $response = $this->exportExcel($aExportData);
                break;
            case 'pdf':
                $projectdata = json_decode($request->get('projectdata'));
                $formdata = json_decode($request->get('formdata'));
                $linechart = $request->get('linechart');
                $mittelwertchart = $request->get('mitelwertchart');
                $cumulated = json_decode($request->get('cumulated'));
                $vault = json_decode($request->get('vault'));
                $bnbprofile = json_decode($request->get('bnbprofile'));

                $response = $this->exportPdf($projectdata, $linechart, $mittelwertchart, $formdata, $cumulated, $bnbprofile, $vault);
                break;

            default:
                $response = new Response('Page not Found', 404);
        }

        return $response;
    }

    protected function exportExcel($aExportData) {
        $aData = [];
        $aHeader = ['Zeit'];

        foreach($aExportData as $variant_id => $variants) {
            $aHeader[] = $variants->legend;
            //$lastTime = null;
            foreach($variants->data as $line => $item) {
                if (!isset($aData[$item->time])) {
                    $aData[$item->time] = [];
                }

                $aData[$item->time][0] = $item->time;
                $aData[$item->time][$variant_id + 1] = number_format((float)$item->y, 0, '', '');
            }
        }

        $aData = array_merge([$aHeader], $aData);

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Products');
        //$sheet->mergeCells('A1:I1');

        $defaultHeaderStyle = array(
            'font' => array(
                'name' => 'Verdana',
                'color' => array('rgb' => '000000'),
                'size' => 9,
                'bold' => true
            ),
            'borders' => array(
                'allborders' => array(
                    'style' => 'thin',
                    'color' => array('rgb' => 'AAAAAA')
                )
            ),
            'fill' => array(
                'fillType' => 'solid',
                'startColor' => array('rgb' => 'DDDDDD'),
            )
        );

        $requiredHeaderStyle = $defaultHeaderStyle;
        $requiredHeaderStyle['fill']['startColor'] = array('rgb' => '9bbb5a');
        $requiredHeaderStyle['font']['color'] = array('rgb' => 'FFFFFF');

        $last = range('A', 'Z')[sizeof($aHeader) - 1];

        // Fill worksheet from values in array
        $sheet->fromArray($aData, NULL, 'A1');
        $sheet->getStyle("A1:".$last."1")->applyFromArray($requiredHeaderStyle);
        //$sheet->getStyle("B2:I2")->applyFromArray($defaultHeaderStyle);

        $writer = new Xlsx($spreadsheet);

        $response =  new StreamedResponse(
            function () use ($writer) {
                $writer->save('php://output');
            }
        );
        $response->headers->set('Content-Type', 'application/vnd.ms-excel');
        $response->headers->set('Content-Disposition', 'attachment;filename="export.xlsx"');
        $response->headers->set('Cache-Control','max-age=0');

        return $response;
    }

    protected function exportPdf($projectdata, $linechart, $mittelwertchart, $formdata, $cumulated, $bnbprofile = [], $vault = []) {
        $dompdf = new Dompdf();

        $logo = $this->getLogo();
        $logo_base64 = 'data:image/png;base64,' . base64_encode(file_get_contents($logo));

        $projectarraydata = $this->objectToArray($projectdata);

        $template = 'pdf.html.twig';
        if ($projectdata->method === 'bnb') {
            $template = 'pdf_bnb.html.twig';
        }

        $html = $this->render($template, [
            'projectdata' => $projectdata,
            'projectarraydata' => $projectarraydata,
            'linechart' => $linechart,
            'mittelwertchart' => $mittelwertchart,
            'formdata' => $formdata,
            'cumulated' => $cumulated,
            'vault' => $vault,
            'logo' => $logo_base64,
            'bnbprofile' => $this->objectToArray($bnbprofile)
        ]);

        echo ($html);
        die;

        //dump($projectdata);
        //die;

        $fontFile = $this->getFont();
        //echo $html;
        //die;

        $dompdf->getFontMetrics()->registerFont(
            ['family' => 'OpenSans', 'style' => 'normal', 'weight' => 'normal'],
            $fontFile
        );

        $dompdf->loadHtml($html);

        $options = new Options();
        $options->set('defaultFont', 'OpenSans');
        $options->setChroot(pathinfo($fontFile)['dirname']);
        $options->setIsRemoteEnabled(true);

        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        $this->injectPageCount($dompdf);

        $dompdf->stream('export.pdf', ['Attachment' => 1]);
        die;
    }

    /**
     * Replace a predefined placeholder with the total page count in the whole PDF document
     *
     * @param Dompdf $dompdf
     */
    protected function injectPageCount(Dompdf $dompdf): void
    {
        /** @var CPDF $canvas */
        $canvas = $dompdf->getCanvas();
        $pdf = $canvas->get_cpdf();

        foreach ($pdf->objects as &$o) {
            if ($o['t'] === 'contents') {
                $o['c'] = str_replace('|||', $canvas->get_page_count(), $o['c']);
            }
        }
    }

    protected function objectToArray($object)
    {
        if(!is_object($object) && !is_array($object)) {
            return $object;
        }

        return array_map([$this,'objectToArray'], (array) $object);
    }

    protected function getFont() {
        $manifest = $this->manifestService->get('_all');

        foreach((array)($manifest) as $key => $value) {
            if (strpos($key, 'co2/images/design/open-sans-v15-latin-regular.') === 0 && strpos($key, '.ttf') !== false){
                return '/var/www/html/public'.$value;
            }
        }
    }

    protected function getLogo() {
        $manifest = $this->manifestService->get('_all');
        
        foreach((array)($manifest) as $key => $value) {
            if ($key === 'images/logo_bbsr.png'){
                return $_SERVER['DOCUMENT_ROOT'].$value;
            }
        }
    }
}